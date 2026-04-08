package models

import "time"

type Profile struct {
	UserID      int64     `db:"user_id" json:"user_id"`
	DisplayName string    `db:"display_name" json:"display_name"`
	Bio         string    `db:"bio" json:"bio"`
	AvatarURL   string    `db:"avatar_url" json:"avatar_url"`
	BannerURL   string    `db:"banner_url" json:"banner_url"`
	Pronouns    string    `db:"pronouns" json:"pronouns"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}
