package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/daiavlo/antiprocrastination/backend/internal/repository"
	"github.com/daiavlo/antiprocrastination/backend/internal/router"

	"github.com/joho/godotenv"
)

func main() {
	// Try loading .env from a few common places
	if err := godotenv.Load(); err != nil {
		if err2 := godotenv.Load("backend/.env"); err2 != nil {
			// As a last resort, try looking in the same directory as the executable itself
			exePath, _ := os.Executable()
			exeDir := filepath.Dir(exePath)
			if err3 := godotenv.Load(filepath.Join(exeDir, ".env")); err3 != nil {
				log.Printf("Failed to load .env file. Err1: %v | Err2: %v | Err3: %v. Using system env\n", err, err2, err3)
			}
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
