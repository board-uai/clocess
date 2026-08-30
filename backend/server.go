package main

import (
	"context"

	"github.com/labstack/echo/v5"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	_ "github.com/board-uai/clocess/docs"
	"github.com/board-uai/clocess/routes"
	"github.com/board-uai/clocess/storage"
	"github.com/board-uai/clocess/utils"
)

// @title clocess backend API
// @version 1.0
// @description This is an API for clocess project
// @BasePath /api

func main() {
	env := utils.NewEnv(&utils.AppLogger, ".env")

	if err := db.Connect(context.Background(), env, &utils.DBLogger); err != nil {
		utils.AppLogger.Err(err).Msg("failed to connect to db")
		panic(err)
	}
	defer db.Pool.Close()

	redisClient := cache.NewRedis(env, &utils.RedisLogger)

	redisStruct := &cache.Redis{
		Client: *redisClient,
		Logger: &utils.RedisLogger,
	}

	storageStruct := &storage.Storage{
		Logger: &utils.StorageLogger,
	}

	e := echo.New()

	api := e.Group("/api")
	routes.SetupRoutes(api, &utils.ApiLogger, &redisStruct.Client, storageStruct)

	err := e.Start(":8080")
	if err != nil {
		utils.AppLogger.Fatal().Err(err).Msg("failed to start backend")
	}
}
