package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/daiavlo/antiprocrastination/backend/internal/repository"
	"github.com/daiavlo/antiprocrastination/backend/internal/router"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env file (only needed in development). Tries current dir, then 'backend/.env' just in case it's run from project root.
	if err := godotenv.Load(); err != nil {
		if err2 := godotenv.Load("backend/.env"); err2 != nil {
			log.Printf("Failed to load .env file. Error 1: %v | Error 2: %v. Using system env\n", err, err2)
		}
	}

	// Connect to PostgreSQL
	db := repository.Connect()
	defer db.Close()

	// Set up all routes + handlers
	r := router.SetUp(db)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server listening on :%s\n", port)

	log.Fatal(http.ListenAndServe(":"+port, r))
}
