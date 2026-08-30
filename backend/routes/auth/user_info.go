package auth

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

// GetUserInfo godoc
// @Summary      Get current user
// @Description  Resolves the session cookie and returns the logged-in user's id and email
// @Tags         auth
// @Produce      json
// @Success      200  {object}  map[string]any  "user_id, email"
// @Failure      401  {object}  map[string]string  "invalid session"
// @Failure      500  {object}  map[string]string
// @Router       /user/me [get]

func GetUserInfo(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
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
	email, err := queries.GetUserEmailById(ctx, userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to find email")
	}

	return c.JSON(http.StatusOK, map[string]any{"user_id": userID, "email": email})
}
