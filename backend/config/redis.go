package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func ConnectRedis() error {
	redisAddress := os.Getenv("REDIS_ADDR")

	if redisAddress == "" {
		return fmt.Errorf("REDIS_ADDR is not set")
	}

	RedisClient = redis.NewClient(&redis.Options{
		Addr: redisAddress,
	})

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()

	if err := RedisClient.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	fmt.Println("Redis connected successfully!")

	return nil
}