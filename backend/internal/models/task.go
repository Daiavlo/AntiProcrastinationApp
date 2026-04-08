package models

import "time"

type Task struct {
	AssignmentID int64     `db:"assignment_id" json:"assignment_id"`
	UserID       int64     `db:"user_id"       json:"user_id"`
	Title        string    `db:"title"         json:"title"`
	Description  string    `db:"description"   json:"description"`
	DueDate      time.Time `db:"due_date"       json:"due_date"`
	Priority     string    `db:"priority"      json:"priority"`
	Status       string    `db:"status"        json:"status"`
	CreatedAt    time.Time `db:"created_at"    json:"created_at"`
}

type CreateTaskRequest struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	DueDate     time.Time `json:"due_date"`
	Priority    string    `json:"priority"`
	Status      string    `json:"status"`
}
