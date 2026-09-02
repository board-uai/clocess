package auth

import (
	"errors"
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	"golang.org/x/crypto/bcrypt"
)

// RegisterUser godoc
// @Summary      Register a new user
// @Description  Creates a user account and starts a session
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body  body      userAuthDTO true  "email + password (min 8 chars)"
// @Success      201   {object}  map[string]any
// @Failure      400   {object}  map[string]string  "invalid body / invalid email / password too short"
// @Failure      409   {object}  map[string]string  "email already registered"
// @Failure      500   {object}  map[string]string
// @Router       /user/create [post]
func RegisterUser(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	var userData userAuthDTO
	if err := c.Bind(&userData); err != nil {
		logger.Err(err).Msg("failed to bind user registry data")
		return echo.NewHTTPError(http.StatusBadRequest, "invalid body")
	}

	if err := userData.ValidateUserAuthInfo(logger); err != nil {
		logger.Err(err).Msg("fail in validating user auth data")
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(userData.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.Err(err).Msg("failed to hash the password")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to hash the password")
	}

	queries := sqlc.New(db.Pool)
	id, err := queries.CreateUser(c.Request().Context(), sqlc.CreateUserParams{
		Email:        userData.Email,
		PasswordHash: string(hash),
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return echo.NewHTTPError(http.StatusConflict, "email already registred")
		}
		logger.Err(err).Msg("failed to create user")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create user")
	}
	logger.Info().Str("user", userData.Email).Msg("user was successfully created")

	if err := cache.CreateSession(c, redis, id, logger); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create session")
	}

	return c.JSON(http.StatusCreated, map[string]any{"id": id})
}

// LoginUser godoc
// @Summary      Log in
// @Description  Verifies credentials, activates the account if inactive, and starts a new session
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body  body      userAuthDTO  true  "email + password"
// @Success      200   {object}  map[string]any
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string  "invalid credentials"
// @Failure      500   {object}  map[string]string
// @Router       /user/login [post]
func LoginUser(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	var userData userAuthDTO
	if err := c.Bind(&userData); err != nil {
		logger.Err(err).Msg("failed to bind user registry data")
		return echo.NewHTTPError(http.StatusBadRequest, "invalid body")
	}

	if err := userData.ValidateUserAuthInfo(logger); err != nil {
		logger.Err(err).Msg("fail in validating user auth data")
		return err
	}

	queries := sqlc.New(db.Pool)
	user, err := queries.GetUserByEmail(c.Request().Context(), userData.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			logger.Err(err).Msg("found no user")
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to find user")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(userData.Password)); err != nil {
		logger.Err(err).Str("email", userData.Email).Msg("failed login atempt")
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}

	logger.Info().Str("user", userData.Email).Msg("user logged in")

	if !user.Active {
		if err := queries.ActivateUser(c.Request().Context(), user.ID); err != nil {
			logger.Err(err).Int32("userID", user.ID).Msg("failed to change user status to active")
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to change user status to active")
		}
	}

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
