package files

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

// GetAllUserFiles godoc
// @Summary      List the current user's files
// @Tags         files
// @Produce      json
// @Success      200  {object}  map[string]any
// @Failure      401  {object}  map[string]string  "invalid session"
// @Failure      500  {object}  map[string]string
// @Router       /file/get_all [get]
func GetAllUserFiles(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
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
	userFiles, err := queries.GetAllUserFiles(c.Request().Context(), userID)
	if err != nil {
		logger.Err(err).Int32("userID", userID).Msg("failed to get user files")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get user files")
	}
	return c.JSON(http.StatusOK, map[string]any{"files": userFiles})
}
