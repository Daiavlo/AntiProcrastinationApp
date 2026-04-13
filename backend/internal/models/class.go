package models

import "time"

type Class struct {
	ClassID   int64     `db:"class_id" json:"class_id"`
	UserID    int64     `db:"user_id"  json:"user_id"`
	Name      string    `db:"name"     json:"name"`
	Color     string    `db:"color"    json:"color"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type CreateClassRequest struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}
