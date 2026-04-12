package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/daiavlo/antiprocrastination/backend/internal/middleware"
	"github.com/daiavlo/antiprocrastination/backend/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB *sql.DB
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	var UserID int64
	// Use quoted "User" as it is case-sensitive in the schema
	err = h.DB.QueryRow(`INSERT INTO "User" (username, password_hash, email) VALUES ($1, $2, $3) RETURNING user_id`, req.Username, string(hash), req.Email).Scan(&UserID)
	if err != nil {
		log.Printf("Registration error: %v", err)
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"user_id": UserID})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var user models.User
	// Use quoted "User" Table
	err := h.DB.QueryRow(`SELECT user_id, password_hash FROM "User" WHERE email = $1`, req.Email).Scan(&user.UserID, &user.PasswordHash)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.UserID,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(),
	})

	tokenStr, _ := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": tokenStr})
}

func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	var profile models.UserProfileResponse
	profile.UserID = int(userID)

	// Get user details and profile images
	var avatarNull, bannerNull, bioNull, pronounsNull sql.NullString
	err := h.DB.QueryRow(`
		SELECT u.username, u.email, p.avatar_url, p.banner_url, p.bio, p.pronouns 
		FROM "User" u
		LEFT JOIN User_profile p ON u.user_id = p.user_id
		WHERE u.user_id = $1
	`, userID).Scan(&profile.Username, &profile.Email, &avatarNull, &bannerNull, &bioNull, &pronounsNull)
	
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	profile.Avatar = avatarNull.String
	profile.Banner = bannerNull.String
	profile.Bio = bioNull.String
	profile.Pronouns = pronounsNull.String

	// If the user has a custom avatar, use it. Otherwise fallback.
	if profile.Avatar == "" {
		profile.Avatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + profile.Username
	}

	// Calculate points (assignments completed this week, Sunday-Saturday)
	err = h.DB.QueryRow(`
		SELECT COUNT(*) FROM Assignment 
		WHERE user_id = $1 
		AND status = 'completed' 
		AND updated_at >= date_trunc('week', now() + interval '1 day') - interval '1 day'
	`, userID).Scan(&profile.Points)
	if err != nil {
		log.Printf("Failed to count weekly completed tasks for user %d: %v", userID, err)
		profile.Points = 0
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func (h *AuthHandler) GetAlienProfile(w http.ResponseWriter, r *http.Request) {
	alienIDStr := chi.URLParam(r, "id")
	// If id doesn't exist or is invalid, just 400
	if alienIDStr == "" {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var profile models.UserProfileResponse
	var avatarNull, bannerNull, bioNull, pronounsNull sql.NullString
	err := h.DB.QueryRow(`
		SELECT u.user_id, u.username, u.email, p.avatar_url, p.banner_url, p.bio, p.pronouns 
		FROM "User" u
		LEFT JOIN User_profile p ON u.user_id = p.user_id
		WHERE u.user_id = $1
	`, alienIDStr).Scan(&profile.UserID, &profile.Username, &profile.Email, &avatarNull, &bannerNull, &bioNull, &pronounsNull)
	
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	profile.Avatar = avatarNull.String
	profile.Banner = bannerNull.String
	profile.Bio = bioNull.String
	profile.Pronouns = pronounsNull.String

	if profile.Avatar == "" {
		profile.Avatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + profile.Username
	}

	// Calculate points
	err = h.DB.QueryRow(`
		SELECT COUNT(*) FROM Assignment 
		WHERE user_id = $1 
		AND status = 'completed' 
		AND updated_at >= date_trunc('week', now() + interval '1 day') - interval '1 day'
	`, profile.UserID).Scan(&profile.Points)
	if err != nil {
		profile.Points = 0
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	// Ensure uploads directory exists
	os.MkdirAll("./uploads", os.ModePerm)

	// Limit upload size (e.g., 10MB)
	r.ParseMultipartForm(10 << 20)

	var avatarURL, bannerURL *string

	// Helper to process uploaded file
	processFile := func(field string) *string {
		file, handler, err := r.FormFile(field)
		if err != nil {
			return nil // No file uploaded for this field
		}
		defer file.Close()

		// Generate unique name
		ext := filepath.Ext(handler.Filename)
		filename := fmt.Sprintf("user_%d_%s_%d%s", userID, field, time.Now().Unix(), ext)
		dstPath := filepath.Join(".", "uploads", filename)

		dst, err := os.Create(dstPath)
		if err != nil {
			log.Printf("Failed to create file: %v", err)
			return nil
		}
		defer dst.Close()

		if _, err := io.Copy(dst, file); err != nil {
			log.Printf("Failed to save file: %v", err)
			return nil
		}

		baseURL := os.Getenv("BASE_URL")
		if baseURL == "" {
			baseURL = "http://localhost:8080"
		}
		urlPath := fmt.Sprintf("%s/uploads/%s", baseURL, filename)
		return &urlPath
	}

	avatarURL = processFile("avatar")
	bannerURL = processFile("banner")

	// Read text fields from form
	reqBio := r.FormValue("bio")
	reqPronouns := r.FormValue("pronouns")

	if avatarURL == nil && bannerURL == nil && reqBio == "" && reqPronouns == "" {
		http.Error(w, "No valid data to update", http.StatusBadRequest)
		return
	}

	// Fetch current to use as fallback
	var currentAvatar, currentBanner, currentBio, currentPronouns sql.NullString
	_ = h.DB.QueryRow(`SELECT avatar_url, banner_url, bio, pronouns FROM User_profile WHERE user_id = $1`, userID).Scan(&currentAvatar, &currentBanner, &currentBio, &currentPronouns)

	finalAvatar := currentAvatar.String
	if avatarURL != nil {
		finalAvatar = *avatarURL
	}
	
	finalBanner := currentBanner.String
	if bannerURL != nil {
		finalBanner = *bannerURL
	}

	finalBio := currentBio.String
	if reqBio != "" {
		finalBio = reqBio
	}

	finalPronouns := currentPronouns.String
	if reqPronouns != "" {
		finalPronouns = reqPronouns
	}

	// UPSERT
	_, err := h.DB.Exec(`
		INSERT INTO User_profile (user_id, avatar_url, banner_url, bio, pronouns) 
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id) DO UPDATE 
		SET avatar_url = EXCLUDED.avatar_url, banner_url = EXCLUDED.banner_url, bio = EXCLUDED.bio, pronouns = EXCLUDED.pronouns, updated_at = CURRENT_TIMESTAMP
	`, userID, finalAvatar, finalBanner, finalBio, finalPronouns)

	if err != nil {
		log.Printf("Failed to update profile: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"avatar":  finalAvatar,
		"banner": finalBanner,
		"bio":     finalBio,
		"pronouns": finalPronouns,
	})
}

