package handlers

import (
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/v2/bson"

	"polling-app/backend/config"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return r.Header.Get("Origin") == "http://localhost:5173"
	},
}

func PollUpdates(c *gin.Context) {
	pollID := c.Param("id")

	_, err := bson.ObjectIDFromHex(pollID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})
		return
	}

	conn, err := upgrader.Upgrade(
		c.Writer,
		c.Request,
		nil,
	)
	if err != nil {
		return
	}

	defer conn.Close()

	channel := fmt.Sprintf(
		"poll:%s",
		pollID,
	)

	ctx := context.Background()

	pubsub := config.RedisClient.Subscribe(
		ctx,
		channel,
	)

	defer pubsub.Close()

	_, err = pubsub.Receive(ctx)
	if err != nil {
		return
	}

	messages := pubsub.Channel()

	for message := range messages {

		err := conn.WriteMessage(
			websocket.TextMessage,
			[]byte(message.Payload),
		)

		if err != nil {
			return
		}
	}
}