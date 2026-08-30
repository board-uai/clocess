package cache

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/board-uai/clocess/utils"
	"github.com/labstack/echo/v5"
	redis "github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

var ErrSessionNotFound = errors.New("session not found")

func CreateSession(c *echo.Context, redis *redis.Client, userID int32, logger *zerolog.Logger) error {
	sessionID, err := utils.GenerateSessionId()
	if err != nil {
		logger.Err(err).Msg("failed to generate sessionID")
		return err
	}
	ctx := c.Request().Context()
	if err = redis.Set(ctx, "session:"+sessionID, userID, 24*time.Hour).Err(); err != nil {
		logger.Err(err).Msg("failed to store user session")
		return err
	}
	c.SetCookie(&http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		MaxAge:   int((24 * time.Hour).Seconds()),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})

	logger.Info().Int32("id", userID).Msg("session for user id was created")

	return nil
}

func DeleteSession(c *echo.Context, redis *redis.Client, logger *zerolog.Logger) error {
	cookie, err := c.Cookie("session_id")
	if err != nil {
		return nil
	}

	ctx := c.Request().Context()
	if err := DeleteSessionByID(ctx, redis, cookie.Value); err != nil {
		logger.Err(err).Str("session", "session:"+cookie.Value).Msg("failed to delete session")
		return err
	}
	c.SetCookie(&http.Cookie{
		Name:     "session_id",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
	logger.Info().Str("session", "session:"+cookie.Value).Msg("session was deleted")
	return nil
}

func DeleteSessionByID(ctx context.Context, redis *redis.Client, sessionID string) error {
	return redis.Del(ctx, "session:"+sessionID).Err()
}

func GetUserIDFromSession(c *echo.Context, ctx context.Context, rdb *redis.Client, logger *zerolog.Logger) (userID int32, err error) {
	sessionID, err := c.Cookie("session_id")
	if err != nil {
		return 0, ErrSessionNotFound
	}

	rawUserID, err := rdb.Get(ctx, "session:"+sessionID.Value).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return 0, ErrSessionNotFound
		}
		logger.Err(err).Msg("redis session lookup failed")
		return 0, err
	}
	parsedUserID, err := strconv.ParseInt(rawUserID, 10, 32)
	if err != nil {
		return 0, err
	}
	return int32(parsedUserID), nil
}

func GetUserSession(c *echo.Context, ctx context.Context, rdb *redis.Client, logger *zerolog.Logger) (sessionID string, err error) {
	sessionIDRaw, err := c.Cookie("session_id")
	if err != nil {
		return "", ErrSessionNotFound
	}
	return sessionIDRaw.Value, nil
}
