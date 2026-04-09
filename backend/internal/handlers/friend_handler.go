package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/daiavlo/antiprocrastination/backend/internal/middleware"
	"github.com/daiavlo/antiprocrastination/backend/internal/models"
)

type FriendHandler struct {
	DB *sql.DB
}

func (h *FriendHandler) SendRequest(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)
	var req models.FriendRequest
	json.NewDecoder(r.Body).Decode(&req)

	if userID == req.FriendID {
		http.Error(w, "You can't send a friend request to yourself", http.StatusBadRequest)
		return
	}
	uid, fid := userID, req.FriendID
	if uid > fid {
		uid, fid = fid, uid
	}

	_, err := h.DB.Exec(
		`INSERT INTO Connection(user_id, friend_id, status, initiated_by)
         VALUES($1, $2, 'pending', $3)
         ON CONFLICT DO NOTHING`,
		uid, fid, userID,
	)
	if err != nil {
		http.Error(w, "request already exists", http.StatusConflict)
		return
	}
	w.WriteHeader(http.StatusCreated)

}

func (h *FriendHandler) GetFriends(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	rows, _ := h.DB.Query(
		`SELECT c.user_id, c.friend_id, c.status
         FROM Connection c
         WHERE (c.user_id=$1 OR c.friend_id=$1)
           AND c.status='accepted'`,
		userID,
	)
	defer rows.Close()

	var conns []models.Connection
	for rows.Next() {
		var c models.Connection
		rows.Scan(&c.UserID, &c.FriendID, &c.Status)
		conns = append(conns, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conns)
}

func (h *FriendHandler) SearchUsers(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]models.UserProfileResponse{})
		return
	}

	rows, err := h.DB.Query(`
		SELECT u.user_id, u.username, p.avatar_url 
		FROM "User" u
		LEFT JOIN User_profile p ON u.user_id = p.user_id
		WHERE u.username ILIKE '%' || $1 || '%'
		LIMIT 20
	`, query)

	if err != nil {
		http.Error(w, "Failed to search users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []models.UserProfileResponse
	for rows.Next() {
		var u models.UserProfileResponse
		var avatarNull sql.NullString
		if err := rows.Scan(&u.UserID, &u.Username, &avatarNull); err == nil {
			u.Avatar = avatarNull.String
			if u.Avatar == "" {
				u.Avatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + u.Username
			}
			users = append(users, u)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

