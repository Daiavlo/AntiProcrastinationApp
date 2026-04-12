package models

import "time"

type Connection struct {
	UserID      int64      `db:"user_id" json:"user_id"`
	FriendID    int64      `db:"friend_id" json:"friend_id"`
	Status      string     `db:"status" json:"status"` // 'pending', 'accepted', 'blocked'
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
	AcceptedAt  *time.Time `db:"accepted_at" json:"accepted_at,omitempty"`
	InitiatedBy int64      `db:"initiated_by" json:"initiated_by"`
}

type FriendRequest struct {
	FriendID int64 `json:"friend_id"`
}

type AcceptFriendRequest struct {
	FriendID int64 `json:"friend_id"`
}

type UserSearchResult struct {
	UserID           int64  `json:"user_id"`
	Username         string `json:"username"`
	Avatar           string `json:"avatar"`
	ConnectionStatus string `json:"connection_status"` // "none" | "sent" | "received" | "accepted"
}
