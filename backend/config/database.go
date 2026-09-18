package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var DB *mongo.Database

func ConnectMongoDB() error {
	mongoURI := os.Getenv("MONGO_URI")
	databaseName := os.Getenv("MONGO_DATABASE")

	if mongoURI == "" {
		return fmt.Errorf("MONGO_URI is not set")
	}

	if databaseName == "" {
		return fmt.Errorf("MONGO_DATABASE is not set")
	}

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)

	clientOptions := options.Client().
		ApplyURI(mongoURI).
		SetServerAPIOptions(serverAPI)

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	client, err := mongo.Connect(clientOptions)
	if err != nil {
		return fmt.Errorf("failed to create MongoDB client: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	DB = client.Database(databaseName)

	fmt.Println("MongoDB connected successfully!")

	return nil
}