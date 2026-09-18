package services

import (
	"context"
	"encoding/json"
	"fmt"

	"polling-app/backend/config"
	"polling-app/backend/models"
)

func PublishPollUpdate(
	ctx context.Context,
	poll models.Poll,
) error {

	channel := fmt.Sprintf(
		"poll:%s",
		poll.ID.Hex(),
	)

	message, err := json.Marshal(poll)
	if err != nil {
		return fmt.Errorf(
			"failed to encode poll update: %w",
			err,
		)
	}

	err = config.RedisClient.Publish(
		ctx,
		channel,
		message,
	).Err()

	if err != nil {
		return fmt.Errorf(
			"failed to publish poll update: %w",
			err,
		)
	}

	return nil
}