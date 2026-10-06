package remotes

import (
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
)

// DeactivateRemote godoc
// @Summary      Deactivate a remote and drop its stored private key
// @Tags         remotes
// @Accept       json
// @Param        body  body  RemoteIDDTO  true  "remote_id"
// @Success      200  "remote deactivated"
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string  "invalid session"
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /remote/deactivate [post]
func DeactivateRemote(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	var remoteRequest RemoteIDDTO
	ctx := c.Request().Context()
	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		if errors.Is(err, cache.ErrSessionNotFound) {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid session")
		}
		logger.Err(err).Msg("failed to find user session")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get user session")
	}
	if err := c.Bind(&remoteRequest); err != nil {
		logger.Err(err).Msg("Can't bind remote_id")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	queries := sqlc.New(db.Pool)
	rows, err := queries.DeactivateUserRemote(ctx, sqlc.DeactivateUserRemoteParams{
		ID:     remoteRequest.RemoteID,
		UserID: userID,
	})
	if err != nil {
		logger.Err(err).Int32("userID", userID).Int32("remote_id", remoteRequest.RemoteID).Msg("failed to deactivate remote")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to deactivate remote")
	}
	if rows == 0 {
		return echo.NewHTTPError(http.StatusNotFound, "remote not found")
	}
	logger.Info().Int32("userID", userID).Int32("remote_id", remoteRequest.RemoteID).Msg("remote was deactivated")

	return c.NoContent(http.StatusOK)
}

// DeleteRemote godoc
// @Summary      Delete a remote and its stored private key
// @Tags         remotes
// @Accept       json
// @Param        body  body  RemoteIDDTO  true  "remote_id"
// @Success      200  "remote deleted"
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string  "invalid session"
// @Failure      404  {object}  map[string]string
// @Failure      409  {object}  map[string]string  "remote still has files"
// @Failure      500  {object}  map[string]string
// @Router       /remote/delete [post]
func DeleteRemote(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	var remoteRequest RemoteIDDTO
	ctx := c.Request().Context()
	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		if errors.Is(err, cache.ErrSessionNotFound) {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid session")
		}
		logger.Err(err).Msg("failed to find user session")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get user session")
	}
	if err := c.Bind(&remoteRequest); err != nil {
		logger.Err(err).Msg("Can't bind remote_id")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	queries := sqlc.New(db.Pool)
	rows, err := queries.DeleteUserRemote(ctx, sqlc.DeleteUserRemoteParams{
		ID:     remoteRequest.RemoteID,
		UserID: userID,
	})
	if err != nil {
		// files.remote_id has no cascade, so a remote with files can't be deleted
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23503" {
			return echo.NewHTTPError(http.StatusConflict, "remote still has files")
		}
		logger.Err(err).Int32("userID", userID).Int32("remote_id", remoteRequest.RemoteID).Msg("failed to delete remote")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete remote")
	}
	if rows == 0 {
		return echo.NewHTTPError(http.StatusNotFound, "remote not found")
	}
	logger.Info().Int32("userID", userID).Int32("remote_id", remoteRequest.RemoteID).Msg("remote was deleted")

	return c.NoContent(http.StatusOK)
}
