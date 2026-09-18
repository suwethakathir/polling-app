package main

import (
	"fmt"
	"log"
	"os"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"polling-app/backend/config"
	"polling-app/backend/routes"
)

func main() {

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	if os.Getenv("JWT_SECRET") == "" {
	log.Fatal("JWT_SECRET is not set")
}

	// Connect to MongoDB
	err = config.ConnectMongoDB()
	if err != nil {
		log.Fatal(err)
	}
	err = config.ConnectRedis()
	if err != nil {
		log.Fatal(err)
	}

	// Create Gin router
	router := gin.Default()
    router.Use(cors.New(cors.Config{
	AllowOrigins:     []string{"http://localhost:5173"},
	AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
	AllowCredentials: true,
}))
	// Test route
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Polling API is running!",
		})
	})
	routes.AuthRoutes(router)
	routes.PollRoutes(router)

	fmt.Println("Server running on http://localhost:8080")

	// Start server
	err = router.Run(":8080")
	if err != nil {
		log.Fatal(err)
	}
}