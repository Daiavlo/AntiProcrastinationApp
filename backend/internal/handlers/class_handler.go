package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/daiavlo/antiprocrastination/backend/internal/middleware"
	"github.com/daiavlo/antiprocrastination/backend/internal/models"
	"github.com/go-chi/chi/v5"
)

type ClassHandler struct {
	DB *sql.DB
}

func (h *ClassHandler) GetClasses(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	rows, err := h.DB.Query(
		`SELECT class_id, user_id, name, color, created_at, updated_at
         FROM Class WHERE user_id=$1 ORDER BY name ASC`,
		userID,
	)

	if err != nil {
		http.Error(w, "Failed to fetch classes", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var classes []models.Class
	for rows.Next() {
		var c models.Class
		if err := rows.Scan(&c.ClassID, &c.UserID, &c.Name, &c.Color, &c.CreatedAt, &c.UpdatedAt); err != nil {
			http.Error(w, "Failed to scan class", http.StatusInternalServerError)
			return
		}
		classes = append(classes, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(classes)
}

func (h *ClassHandler) CreateClass(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)
	var req models.CreateClassRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var id int64
	err := h.DB.QueryRow(
		`INSERT INTO Class(user_id, name, color)
         VALUES($1, $2, $3) RETURNING class_id`,
		userID, req.Name, req.Color,
	).Scan(&id)

	if err != nil {
		http.Error(w, "Failed to create class", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"class_id": id})
}

func (h *ClassHandler) UpdateClass(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)
	classID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	var req models.CreateClassRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err := h.DB.Exec(
		`UPDATE Class SET name=$1, color=$2, updated_at=NOW() 
         WHERE class_id=$3 AND user_id=$4`,
		req.Name, req.Color, classID, userID,
	)
	if err != nil {
		http.Error(w, "Failed to update class", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *ClassHandler) DeleteClass(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)
	classID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	_, err := h.DB.Exec("DELETE FROM Class WHERE class_id=$1 AND user_id=$2", classID, userID)
	if err != nil {
		http.Error(w, "Failed to delete class", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
