package auth

import (
	"errors"
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	"golang.org/x/crypto/bcrypt"
)

// dummyHash keeps a login for an unknown email as slow as one with a wrong password
var dummyHash, _ = bcrypt.GenerateFromPassword([]byte("timing-equaliser"), bcrypt.DefaultCost)

// LoginUser godoc
// @Summary      Log in
// @Description  Verifies credentials and starts a new session, a deactivated account is refused
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body  body      userAuthDTO  true  "email + password"
// @Success      200   {object}  map[string]any
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string  "invalid credentials"
// @Failure      403   {object}  map[string]string  "this account is deactivated"
// @Failure      500   {object}  map[string]string
// @Router       /user/login [post]
func LoginUser(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	userData, err := bindUserAuth(c)
	if err != nil {
		return err
	}
	if err := userData.ValidateLogin(); err != nil {
		return err
	}

	queries := sqlc.New(db.Pool)
	user, err := queries.GetUserByEmail(c.Request().Context(), userData.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			_ = bcrypt.CompareHashAndPassword(dummyHash, []byte(userData.Password))
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
		}
		logger.Err(err).Msg("failed to find user")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to find user")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(userData.Password)); err != nil {
		logger.Info().Int32("userID", user.ID).Msg("failed login attempt")
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}

	if !user.Active {
		return echo.NewHTTPError(http.StatusForbidden, "this account is deactivated")
	}
	logger.Info().Int32("userID", user.ID).Msg("user logged in")

	ctx := c.Request().Context()
	if cookie, err := c.Cookie("session_id"); err == nil {
		if err := cache.DeleteSessionByID(ctx, redis, cookie.Value); err != nil {
			logger.Err(err).Str("session", "session:"+cookie.Value).Msg("failed to delete user session")
		} else {
			logger.Info().Str("session", cookie.Value).Msg("session was deleted")
		}
	}
	if err := cache.CreateSession(c, redis, user.ID, logger); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create session")
	}

	return c.JSON(http.StatusOK, map[string]any{"id": user.ID})
}
