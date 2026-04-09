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

type TaskHandler struct {
	DB *sql.DB
}

func (h *TaskHandler) GetTasks(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)

	rows, err := h.DB.Query(
		`SELECT assignment_id, title, description, due_date, priority, status, created_at, updated_at
         FROM Assignment WHERE user_id=$1 ORDER BY due_date ASC`,
		userID,
	)

	if err != nil {
		http.Error(w, "Failed to fetch tasks", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		if err := rows.Scan(&task.AssignmentID, &task.Title, &task.Description, &task.DueDate, &task.Priority, &task.Status, &task.CreatedAt, &task.UpdatedAt); err != nil {
			http.Error(w, "Failed to fetch tasks", http.StatusInternalServerError)
			return
		}
		tasks = append(tasks, task)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)
	var req models.CreateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var id int64
	err := h.DB.QueryRow(
		`INSERT INTO Assignment(user_id,title,description,due_date,priority,status)
         VALUES($1,$2,$3,$4,$5,'pending') RETURNING assignment_id`,
		userID, req.Title, req.Description, req.DueDate, req.Priority,
	).Scan(&id)

	if err != nil {
		http.Error(w, "Failed to create task", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"assignment_id": id})
}

func (h *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)
	taskID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	h.DB.Exec("DELETE FROM Assignment WHERE assignment_id=$1 AND user_id=$2", taskID, userID)
	w.WriteHeader(http.StatusNoContent)
}

func (h *TaskHandler) UpdateTaskStatus(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(int64)
	taskID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err := h.DB.Exec(
		`UPDATE Assignment SET status=$1, updated_at=NOW() WHERE assignment_id=$2 AND user_id=$3`, 
		req.Status, taskID, userID,
	)
	if err != nil {
		http.Error(w, "Failed to update task status", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
