package routes

import (
	"github.com/gin-gonic/gin"

	"polling-app/backend/handlers"
)

func AuthRoutes(router *gin.Engine) {
	authRoutes := router.Group("/api/auth")
	{
		authRoutes.POST("/signup", handlers.Signup)
		authRoutes.POST("/login", handlers.Login)
	}
}