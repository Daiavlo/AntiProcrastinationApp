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
	// Load .env file (only needed in development)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system env")
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
