package settings

import (
	"errors"
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

// DeactivateUser godoc
// @Summary      Deactivate the current account
// @Tags         settings
// @Success      200  "account deactivated"
// @Failure      401  {object}  map[string]string  "invalid session"
// @Failure      500  {object}  map[string]string
// @Router       /user/settings/deactivate [post]
func DeactivateUser(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	ctx := c.Request().Context()

	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		if errors.Is(err, cache.ErrSessionNotFound) {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid session")
		}
		logger.Err(err).Msg("failed to find user session")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get user session")
	}

	queries := sqlc.New(db.Pool)
	if err := queries.DeactivateUser(ctx, userID); err != nil {
		logger.Err(err).Int32("userID", userID).Msg("failed to set status not active to user")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to change status of user")
	}

	if err := cache.DeleteSession(c, redis, logger); err != nil {
		logger.Err(err).Int32("userID", userID).Msg("failed to delete user session")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete user session")
	}
	logger.Info().Int32("userID", userID).Msg("user was deactivated")

	return c.NoContent(http.StatusOK)
}
