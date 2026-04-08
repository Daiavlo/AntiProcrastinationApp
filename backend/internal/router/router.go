package router

import (
	"database/sql"
	"net/http"

	"github.com/daiavlo/antiprocrastination/backend/internal/handlers"
	appMiddleware "github.com/daiavlo/antiprocrastination/backend/internal/middleware"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func SetUp(db *sql.DB) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	authH := &handlers.AuthHandler{DB: db}
	taskH := &handlers.TaskHandler{DB: db}
	friendH := &handlers.FriendHandler{DB: db}

	r.Post("/api/register", authH.Register)
	r.Post("/api/login", authH.Login)

	// Protected routes — JWT required
	r.Group(func(r chi.Router) {
		r.Use(appMiddleware.AuthMiddleware)

		r.Get("/api/tasks", taskH.GetTasks)
		r.Post("/api/tasks", taskH.CreateTask)
		r.Delete("/api/tasks/{id}", taskH.DeleteTask)

		r.Get("/api/friends", friendH.GetFriends)
		r.Post("/api/friends/add", friendH.SendRequest)
	})

	return r
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization,Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(204)
			return
		}
		next.ServeHTTP(w, r)
	})
}
