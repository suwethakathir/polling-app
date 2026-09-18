package handlers

import (
	"net/http"
	"strings"
	"time"
	"context"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"

	"polling-app/backend/config"
	"polling-app/backend/models"
	"polling-app/backend/services"
)

type CreatePollRequest struct {
	Question string   `json:"question"`
	Options  []string `json:"options"`
}

func CreatePoll(c *gin.Context) {
	var request CreatePollRequest

	// Read JSON sent by the frontend
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request data",
		})
		return
	}

	// Backend validation
	request.Question = strings.TrimSpace(request.Question)

	if request.Question == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Poll question is required",
		})
		return
	}

	if len(request.Options) < 2 || len(request.Options) > 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Poll must have between 2 and 6 options",
		})
		return
	}

	// Validate every option
	options := make([]models.PollOption, 0, len(request.Options))

	for _, option := range request.Options {
		option = strings.TrimSpace(option)

		if option == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Options cannot be empty",
			})
			return
		}

		options = append(options, models.PollOption{
			ID:    bson.NewObjectID().Hex(),
			Text:  option,
			Votes: 0,
		})
	}

	// Create poll
	poll := models.Poll{
		Question:  request.Question,
		Options:   options,
		CreatedBy: c.GetString("userId"),
		CreatedAt: time.Now(),
	}

	// Save to MongoDB
	collection := config.DB.Collection("polls")

	result, err := collection.InsertOne(c.Request.Context(), poll)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create poll",
		})
		return
	}

	poll.ID = result.InsertedID.(bson.ObjectID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Poll created successfully",
		"poll":    poll,
	})
}

func GetPolls(c *gin.Context) {
	userID := c.GetString("userId")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User authentication required",
		})
		return
	}

	collection := config.DB.Collection("polls")

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	cursor, err := collection.Find(
		ctx,
		bson.M{
			"createdBy": userID,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch polls",
		})
		return
	}

	defer cursor.Close(ctx)

	var polls []models.Poll

	if err := cursor.All(ctx, &polls); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read polls",
		})
		return
	}

	if polls == nil {
		polls = []models.Poll{}
	}

	c.JSON(http.StatusOK, gin.H{
		"polls": polls,
	})
}


func GetPollByID(c *gin.Context) {
	pollID := c.Param("id")

	objectID, err := bson.ObjectIDFromHex(pollID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})
		return
	}

	collection := config.DB.Collection("polls")

	var poll models.Poll

	err = collection.FindOne(
		c.Request.Context(),
		bson.M{
			"_id": objectID,
		},
	).Decode(&poll)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Poll not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"poll": poll,
	})
}

type VoteRequest struct {
	OptionID string `json:"optionId"`
}

func VotePoll(c *gin.Context) {
	pollID := c.Param("id")

	objectID, err := bson.ObjectIDFromHex(pollID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})
		return
	}

	var request VoteRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid vote data",
		})
		return
	}

	request.OptionID = strings.TrimSpace(request.OptionID)

	if request.OptionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Option ID is required",
		})
		return
	}

	collection := config.DB.Collection("polls")

	filter := bson.M{
		"_id":        objectID,
		"options.id": request.OptionID,
	}

	update := bson.M{
		"$inc": bson.M{
			"options.$.votes": 1,
		},
	}

	result, err := collection.UpdateOne(
		c.Request.Context(),
		filter,
		update,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to record vote",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Poll or option not found",
		})
		return
	}

	// Fetch the updated poll
	var updatedPoll models.Poll

	err = collection.FindOne(
		c.Request.Context(),
		bson.M{
			"_id": objectID,
		},
	).Decode(&updatedPoll)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch updated poll",
		})
		return
	}

	// Publish updated poll through Redis
	err = services.PublishPollUpdate(
		c.Request.Context(),
		updatedPoll,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Vote recorded but failed to publish update",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Vote recorded successfully",
		"poll":    updatedPoll,
	})
}

func DeletePoll(c *gin.Context) {
	userID := c.GetString("userId")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User authentication is required",
		})
		return
	}

	pollID := c.Param("id")

	objectID, err := bson.ObjectIDFromHex(pollID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})
		return
	}

	filter := bson.M{
		"_id":       objectID,
		"createdBy": userID,
	}

	result, err := config.DB.Collection("polls").DeleteOne(
		c.Request.Context(),
		filter,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete poll",
		})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Poll not found or you do not have permission to delete it",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Poll deleted successfully",
	})
}