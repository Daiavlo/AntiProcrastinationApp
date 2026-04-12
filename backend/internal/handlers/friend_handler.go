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

// POST /api/friends/add
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

// POST /api/friends/accept
func (h *FriendHandler) AcceptRequest(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	var req models.FriendRequest
	json.NewDecoder(r.Body).Decode(&req)

	uid, fid := userID, req.FriendID
	if uid > fid {
		uid, fid = fid, uid
	}

	result, err := h.DB.Exec(
		`UPDATE Connection
         SET status = 'accepted'
         WHERE user_id = $1
           AND friend_id = $2
           AND status = 'pending'
           AND initiated_by != $3`,
		uid, fid, userID,
	)
	if err != nil {
		http.Error(w, "Failed to accept request", http.StatusInternalServerError)
		return
	}

	affected, _ := result.RowsAffected()
	if affected == 0 {
		http.Error(w, "No pending request found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// GET /api/friends/pending
func (h *FriendHandler) GetPendingRequests(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	rows, err := h.DB.Query(`
		SELECT u.user_id, u.username, COALESCE(p.avatar_url, '')
		FROM Connection c
		JOIN users u ON u.user_id = c.initiated_by
		LEFT JOIN User_profile p ON p.user_id = c.initiated_by
		WHERE (c.user_id = $1 OR c.friend_id = $1)
		  AND c.status = 'pending'
		  AND c.initiated_by != $1
	`, userID)
	if err != nil {
		http.Error(w, "Failed to fetch pending requests", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// ✅ initialize to empty slice so JSON encodes as [] not null
	users := []models.UserProfileResponse{}
	for rows.Next() {
		var u models.UserProfileResponse
		var avatar string
		if err := rows.Scan(&u.UserID, &u.Username, &avatar); err == nil {
			if avatar == "" {
				avatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + u.Username
			}
			u.Avatar = avatar
			users = append(users, u)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// GET /api/friends
func (h *FriendHandler) GetFriends(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	rows, err := h.DB.Query(`
		SELECT c.user_id, c.friend_id, c.status
		FROM Connection c
		WHERE (c.user_id = $1 OR c.friend_id = $1)
		  AND c.status = 'accepted'
	`, userID)
	if err != nil {
		http.Error(w, "Failed to fetch friends", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// ✅ initialize to empty slice so JSON encodes as [] not null
	conns := []models.Connection{}
	for rows.Next() {
		var c models.Connection
		rows.Scan(&c.UserID, &c.FriendID, &c.Status)
		conns = append(conns, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conns)
}

// GET /api/users/search?q=...
func (h *FriendHandler) SearchUsers(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)
	query := r.URL.Query().Get("q")

	if query == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]models.UserSearchResult{})
		return
	}

	rows, err := h.DB.Query(`
		SELECT
			u.user_id,
			u.username,
			COALESCE(p.avatar_url, '') AS avatar_url,
			CASE
				WHEN c.status IS NULL        THEN 'none'
				WHEN c.status = 'accepted'   THEN 'accepted'
				WHEN c.initiated_by = $2     THEN 'sent'
				ELSE                              'received'
			END AS connection_status
		FROM users u
		LEFT JOIN User_profile p ON u.user_id = p.user_id
		LEFT JOIN Connection c ON (
			(c.user_id   = u.user_id AND c.friend_id = $2) OR
			(c.friend_id = u.user_id AND c.user_id   = $2)
		)
		WHERE u.username ILIKE '%' || $1 || '%'
		  AND u.user_id != $2
		LIMIT 20
	`, query, userID)
	if err != nil {
		http.Error(w, "Failed to search users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// ✅ initialize to empty slice so JSON encodes as [] not null
	users := []models.UserSearchResult{}
	for rows.Next() {
		var u models.UserSearchResult
		var avatar string
		if err := rows.Scan(&u.UserID, &u.Username, &avatar, &u.ConnectionStatus); err == nil {
			if avatar == "" {
				avatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + u.Username
			}
			u.Avatar = avatar
			users = append(users, u)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
