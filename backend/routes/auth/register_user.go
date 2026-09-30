package auth

import (
	"errors"
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
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
// @Failure      400   {object}  map[string]string  "invalid body / invalid email / password too short / too long"
// @Failure      409   {object}  map[string]string  "email already registered"
// @Failure      500   {object}  map[string]string
// @Router       /user/create [post]
func RegisterUser(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	userData, err := bindUserAuth(c)
	if err != nil {
		return err
	}
	if err := userData.ValidateRegister(); err != nil {
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
			return echo.NewHTTPError(http.StatusConflict, "email already registered")
		}
		logger.Err(err).Msg("failed to create user")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create user")
	}
	logger.Info().Int32("userID", id).Msg("user was successfully created")

	if err := cache.CreateSession(c, redis, id, logger); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create session")
	}

	return c.JSON(http.StatusCreated, map[string]any{"id": id})
}
