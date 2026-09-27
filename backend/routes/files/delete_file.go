package files

import (
	"errors"
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
	"github.com/board-uai/clocess/storage"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

// DeleteFile godoc
// @Summary      Delete a file
// @Tags         files
// @Accept       json
// @Param        body  body  deleteFileDTO  true  "file_id and file_name"
// @Success      200
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /file/delete [post]
func DeleteFile(c *echo.Context, logger *zerolog.Logger, redis *redis.Client, s *storage.Storage, masterKey []byte) error {
	var deleteFileRequest deleteFileDTO
	ctx := c.Request().Context()
	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	if err := c.Bind(&deleteFileRequest); err != nil {
		logger.Err(err).Msg("Can't bind file_id")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	queries := sqlc.New(db.Pool)
	remoteID, err := queries.GetFileRemote(ctx, sqlc.GetFileRemoteParams{
		ID:       deleteFileRequest.FileID,
		UserID:   userID,
		Filename: deleteFileRequest.Filename,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "file not found")
		}
		logger.Err(err).Msg("failed to find remoteID by request")
		return echo.NewHTTPError(http.StatusInternalServerError, "internalServerError")
	}

	filename, err := queries.GetFileName(ctx, sqlc.GetFileNameParams{
		ID:       deleteFileRequest.FileID,
		UserID:   userID,
		RemoteID: remoteID,
	})
	if err != nil {
		logger.Err(err).Int32("file_id", deleteFileRequest.FileID).Msg("failed to get filename name of fileID")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get filename name of fileID")
	}

	remoteInfo, err := queries.GetRemoteConnection(ctx, sqlc.GetRemoteConnectionParams{
		ID:     remoteID,
		UserID: userID,
	})
	if err != nil {
		logger.Err(err).Int32("remote_id", remoteID).Msg("failed to get remote connection info")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get remote connection info")
	}

	remoteConnectionInfo := storage.RemoteConnection{
		UserID:           userID,
		RemoteID:         remoteID,
		RemoteHost:       remoteInfo.Host,
		RemotePort:       remoteInfo.Port,
		RemoteUsername:   remoteInfo.Username,
		RemoteBasePath:   remoteInfo.BasePath,
		RemotePrivKey:    remoteInfo.EncryptedPrivateKey,
		RemoteKeyVersion: remoteInfo.KeyVersion,
	}

	if err := s.DeleteFile(remoteConnectionInfo, int(deleteFileRequest.FileID), filename); err != nil {
		logger.Err(err).Int32("file_id", deleteFileRequest.FileID).Msg("failed to delete file from disk")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete file")
	}

	if _, err := queries.DeleteFile(ctx, sqlc.DeleteFileParams{
		ID:       deleteFileRequest.FileID,
		UserID:   userID,
		RemoteID: remoteID,
	}); err != nil {
		logger.Err(err).Int32("file_id", deleteFileRequest.FileID).Msg("failed to delete file record")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete file")
	}
	return nil
}
