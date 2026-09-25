package remotes

import (
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
	"github.com/board-uai/clocess/storage"
	"github.com/board-uai/clocess/utils"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

func RemoteStatus(c *echo.Context, logger *zerolog.Logger, redis *redis.Client, remoteContext *AddRemoteDTO) error {
	ctx := c.Request().Context()
	var remoteStatusInfo *RemoteStatusDTO
	if err := c.Bind(&remoteContext); err != nil {
		logger.Err(err).Msg("Can't bind remote DTO")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	queries := sqlc.New(db.Pool)

	fingerPrints, err := queries.GetServerFingerPrints(ctx, sqlc.GetServerFingerPrintsParams{
		UserID: userID,
		ID:     remoteStatusInfo.RemoteID,
	})
	if err != nil {
		return nil
	}

	remoteInfo, err := queries.GetServerConnectionInfo(ctx, remoteStatusInfo.RemoteID)
	if err != nil {
		return nil
	}

	remoteConnectionInfo := storage.RemoteConnection{
		UserID:           userID,
		RemoteID:         remoteStatusInfo.RemoteID,
		RemoteHost:       remoteInfo[0].Host,
		RemotePort:       remoteInfo[0].Port,
		RemoteUsername:   remoteInfo[0].Username,
		RemoteBasePath:   remoteInfo[0].BasePath,
		RemotePrivKey:    remoteInfo[0].EncryptedPrivateKey,
		RemoteKeyVersion: remoteInfo[0].KeyVersion,
	}

	if err := utils.RemoteStatusCheck(&remoteConnectionInfo, logger, remoteInfo[0].EncryptedPrivateKey, fingerPrints.HostKeyFingerprint.String); err != nil {
		return nil
	}
	return c.JSON(http.StatusOK, "PONG")
}
