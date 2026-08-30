package middleware

import (
	"errors"
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

func RequireSession(redis *redis.Client, logger *zerolog.Logger) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			ctx := c.Request().Context()
			userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
			if err != nil {
				if errors.Is(err, cache.ErrSessionNotFound) {
					return echo.NewHTTPError(http.StatusUnauthorized, "invalid session")
				}
				logger.Err(err).Msg("redis session lookup failed")
				return echo.NewHTTPError(http.StatusInternalServerError, "session check failed")
			}
			c.Set("user_id", userID)
			return next(c)
		}
	}
}
