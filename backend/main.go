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
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
    frontendURL := os.Getenv("FRONTEND_URL")

if frontendURL == "" {
    frontendURL = "http://localhost:5173"
}

router.Use(cors.New(cors.Config{
    AllowOrigins: []string{frontendURL},
    AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
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

	port := os.Getenv("PORT")

if port == "" {
    port = "8080"
}

fmt.Println("Server running on port " + port)

err = router.Run(":" + port)
	if err != nil {
		log.Fatal(err)
	}
}