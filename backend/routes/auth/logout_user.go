package auth

import (
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

// LogoutUser godoc
// @Summary      Log out
// @Description  Deletes the current session
// @Tags         auth
// @Success      200  "session deleted"
// @Failure      500  {object}  map[string]string
// @Router       /user/logout [post]
func LogoutUser(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	if err := cache.DeleteSession(c, redis, logger); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete user session")
	}
	return c.NoContent(http.StatusOK)
}
