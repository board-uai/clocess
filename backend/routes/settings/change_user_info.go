package settings

import (
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	"golang.org/x/crypto/bcrypt"
)

// ChangeUserPassword godoc
// @Summary      Change password
// @Description  Requires an active session and confirmation of the current password, ends every other session
// @Tags         settings
// @Accept       json
// @Param        body  body      changeUserPasswordDTO  true  "old_password + new_password (min 8 chars)"
// @Success      200   "password changed"
// @Failure      400   {object}  map[string]string  "invalid body / password too short"
// @Failure      401   {object}  map[string]string  "invalid session"
// @Failure      403   {object}  map[string]string  "current password is wrong"
// @Failure      500   {object}  map[string]string
// @Router       /user/settings/change_password [patch]
func ChangeUserPassword(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	var changeUserPasswordData changeUserPasswordDTO
	ctx := c.Request().Context()
	if err := c.Bind(&changeUserPasswordData); err != nil {
		logger.Err(err).Msg("failed to bind user registry data")
		return echo.NewHTTPError(http.StatusBadRequest, "invalid body")
	}

	if err := changeUserPasswordData.ValidateUserPassword(logger); err != nil {
		logger.Err(err).Msg("fail in validating user auth data")
		return err
	}

	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	queries := sqlc.New(db.Pool)
	currentPassHash, err := queries.GetUserPasswordHash(ctx, userID)
	if err != nil {
		logger.Err(err).Int32("userID", userID).Msg("failed to get user password")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get user password")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(currentPassHash), []byte(changeUserPasswordData.OldPassword)); err != nil {
		logger.Err(err).Int32("userID", userID).Msg("failed to update password: old password is not correct")
		// not 401, the session is fine and the client signs out on 401
		return echo.NewHTTPError(http.StatusForbidden, "current password is wrong")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(changeUserPasswordData.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		logger.Err(err).Msg("failed to hash the password")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to hash the password")
	}

	if err := queries.ChangeUserPassword(ctx, sqlc.ChangeUserPasswordParams{
		PasswordHash: string(hash),
		ID:           userID,
	}); err != nil {
		logger.Err(err).Msg("failed to update user password")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update user password")
	}

	// a stolen session must not outlive the password, this browser gets a fresh one
	if err := cache.DeleteUserSessions(ctx, redis, userID); err != nil {
		logger.Err(err).Int32("userID", userID).Msg("failed to delete user sessions")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete user sessions")
	}
	if err := cache.CreateSession(c, redis, userID, logger); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create session")
	}

	return c.NoContent(http.StatusOK)
}
