package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/jackc/pgx/v5/stdlib" // blank import registers the driver
)

func main() {
	dsn := "postgres://postgres:password@localhost:5432/AntiProcrastinationApp?sslmode=disable"
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatal("failed to open db:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("cannot reach database:", err)
	}

	fmt.Println("Connected to PostgreSQL!")
}
