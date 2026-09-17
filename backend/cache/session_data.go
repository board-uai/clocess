package cache

import (
	"time"

	"github.com/labstack/echo/v5"
	redis "github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

func AddDataToSession(c *echo.Context, redis *redis.Client, logger *zerolog.Logger, sessionData map[string]string, ttl time.Duration) error {
	ctx := c.Request().Context()
	userSessionID, err := GetUserSession(c, ctx, redis, logger)
	if err != nil {
		return err
	}

	key := "session_data:" + userSessionID
	pipe := redis.TxPipeline()
	pipe.HSet(ctx, key, sessionData)
	pipe.Expire(ctx, key, ttl)
	if _, err := pipe.Exec(ctx); err != nil {
		return err
	}

	return nil
}
