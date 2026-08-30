package cache

import (
	"context"

	"github.com/board-uai/clocess/utils"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

type Redis struct {
	Client redis.Client
	Logger *zerolog.Logger
}

func NewRedis(env *utils.Env, logger *zerolog.Logger) *redis.Client {
	redisAddress := env.Get("REDIS_ADDRESS")

	opt, err := redis.ParseURL(redisAddress)
	if err != nil {
		logger.Error().Err(err).Msg("failed to connect to redis")
		panic(err)
	}

	client := redis.NewClient(opt)
	if err := PingRedis(client, logger); err != nil {
		logger.Err(err).Msg("redis has not connected")
		panic(err)
	}
	logger.Info().Msg("redis has been initialized")
	return client
}

func PingRedis(client *redis.Client, logger *zerolog.Logger) error {
	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		logger.Err(err).Msg("redis ping failed")
		return err
	}
	logger.Info().Msg("redis ping ok")
	return nil
}
