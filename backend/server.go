package main

import (
	"context"
	"encoding/base64"

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
	masterKeyB64 := env.Get("REMOTE_MASTER_KEY")
	masterKey, err := base64.StdEncoding.DecodeString(masterKeyB64)
	if err != nil || len(masterKey) != 32 {
		utils.AppLogger.Fatal().Msg("invalid REMOTE_MASTER_KEY")
	}

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
	routes.SetupRoutes(api, &utils.ApiLogger, &redisStruct.Client, storageStruct, masterKey)

	err = e.Start(":8080")
	if err != nil {
		utils.AppLogger.Fatal().Err(err).Msg("failed to start backend")
	}
}
