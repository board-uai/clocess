package remotes

import (
	"errors"
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
	crypt "github.com/board-uai/clocess/utils"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

func RemoteStatus(c *echo.Context, logger *zerolog.Logger, redis *redis.Client, masterKey []byte) error {
	var remoteStatusRequest RemoteIDDTO
	ctx := c.Request().Context()
	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		if errors.Is(err, cache.ErrSessionNotFound) {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid session")
		}
		logger.Err(err).Msg("failed to find user session")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get user session")
	}
	if err := c.Bind(&remoteStatusRequest); err != nil {
		logger.Err(err).Msg("Can't bind remote_id")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	queries := sqlc.New(db.Pool)
	remoteInfo, err := queries.GetRemoteConnection(ctx, sqlc.GetRemoteConnectionParams{
		ID:     remoteStatusRequest.RemoteID,
		UserID: userID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "remote not found")
		}
		logger.Err(err).Int32("remote_id", remoteStatusRequest.RemoteID).Msg("failed to get remote connection info")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get remote connection info")
	}
	// an existing remote without a stored fingerprint is broken, never fall back to TOFU here
	if remoteInfo.HostKeyFingerprint.String == "" {
		logger.Error().Int32("remote_id", remoteInfo.ID).Msg("remote has no stored host key fingerprint")
		return echo.NewHTTPError(http.StatusInternalServerError, "remote has no stored host key")
	}

	privateKey, err := crypt.DecryptMaster(masterKey, remoteInfo.EncryptedPrivateKey)
	if err != nil {
		logger.Err(err).Int32("remote_id", remoteInfo.ID).Msg("failed to decrypt private Key")
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	if _, err := CheckRemote(&AddRemoteDTO{
		Host:     remoteInfo.Host,
		HostUser: remoteInfo.Username,
		HostPort: remoteInfo.Port,
		BasePath: remoteInfo.BasePath,
	}, logger, privateKey, remoteInfo.HostKeyFingerprint.String); err != nil {
		if errors.Is(err, ErrHostKeyMismatch) {
			logger.Warn().Int32("remote_id", remoteInfo.ID).Msg("remote host key changed")
			return echo.NewHTTPError(http.StatusForbidden, "remote host key changed")
		}
		return echo.NewHTTPError(http.StatusBadGateway, "remote unreachable")
	}
	return c.NoContent(http.StatusOK)
}
