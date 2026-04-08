package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("Starting AntiProcrastinationApp API...")

	// The standard library's net/http router
	mux := http.NewServeMux()

	// Define your first route here:
	// mux.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
	//     fmt.Fprintf(w, "pong")
	// })

	fmt.Println("Server listening on :8080")
	http.ListenAndServe(":8080", mux)
}
