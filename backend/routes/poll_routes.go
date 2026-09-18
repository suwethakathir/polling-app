package routes

import (
	"github.com/gin-gonic/gin"
	"polling-app/backend/middleware"
	"polling-app/backend/handlers"
)

func PollRoutes(router *gin.Engine) {

	pollRoutes := router.Group("/api/polls")
	{
		pollRoutes.POST(
	"",
	middleware.AuthMiddleware(),
	handlers.CreatePoll,
)
		pollRoutes.GET(
	"",
	middleware.AuthMiddleware(),
	handlers.GetPolls,
)
		pollRoutes.GET("/:id", handlers.GetPollByID)
		pollRoutes.POST("/:id/vote", handlers.VotePoll)
		pollRoutes.GET("/:id/live", handlers.PollUpdates)
		pollRoutes.DELETE("/:id", middleware.AuthMiddleware(), handlers.DeletePoll)

	}
}