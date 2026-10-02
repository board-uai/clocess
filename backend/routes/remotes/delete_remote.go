package remotes

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
)

func DeactivateRemote(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	var deleteRemoteData DeleteUserRemoteDTO
	ctx := c.Request().Context()
	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	if err := c.Bind(&deleteRemoteData); err != nil {
		logger.Err(err).Msg("Can't bind file_id")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	queries := sqlc.New(db.Pool)
	if err = queries.DeactivateUserRemote(ctx, sqlc.DeactivateUserRemoteParams{
		ID:     deleteRemoteData.RemoteId,
		UserID: userID,
	}); err != nil {
		// here I also need to check whatever db error is 0 rows
		logger.Err(err).Msg("failed to deactivate user quer")
		return echo.NewHTTPError(http.StatusAccepted, "good")
	}
	return c.JSON(http.StatusOK, "server deactivated")
}

func DeleteRemote(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	var deleteRemoteData DeleteUserRemoteDTO
	ctx := c.Request().Context()
	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	if err := c.Bind(&deleteRemoteData); err != nil {
		logger.Err(err).Msg("Can't bind file_id")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	queries := sqlc.New(db.Pool)
	if err = queries.DeleteUserRemote(ctx, sqlc.DeleteUserRemoteParams{
		ID:     deleteRemoteData.RemoteId,
		UserID: userID,
	}); err != nil {
		// here I also need to check whatever db error is 0 rows
		logger.Err(err).Msg("failed to deactivate user quer")
		return echo.NewHTTPError(http.StatusAccepted, "good")
	}
	return c.JSON(http.StatusOK, "server deleted")
}
