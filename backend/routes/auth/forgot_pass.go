package auth

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

func ForgotPassword(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	logger.Info().Msg("NotImplementedError")
	return echo.NewHTTPError(http.StatusInternalServerError, "NotImplementedEror")
}
