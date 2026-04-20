package models

import "time"

type User struct {
	UserID       int       `db:"user_id"  json:"user_id"`
	Username     string    `db:"username"  json:"username"`
	PasswordHash string    `db:"password_hash"  json:"-"`
	Email        string    `db:"email"   json:"email"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserProfileResponse struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Avatar   string `json:"avatar"`
	Banner   string `json:"banner"`
	Bio      string               `json:"bio"`
	Pronouns string               `json:"pronouns"`
	Points   int                  `json:"points"`
	WeeklySummary []WeeklyPointSummary `json:"weekly_summary,omitempty"`
}

type ClassStat struct {
	ClassName string `json:"class_name"`
	Color     string `json:"color"`
	Points    int    `json:"points"`
}

type WeeklyPointSummary struct {
	WeekStart  time.Time   `json:"week_start"`
	Points     int         `json:"points"`
	ClassStats []ClassStat `json:"class_stats"`
}
