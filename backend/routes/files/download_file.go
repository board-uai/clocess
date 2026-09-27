package files

import (
	"errors"
	"fmt"
	"mime"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
	"github.com/board-uai/clocess/storage"

	"github.com/board-uai/clocess/cache"
	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

var quoteEscaper = strings.NewReplacer(`\`, `\\`, `"`, `\"`)

// DownloadUserFile godoc
// @Summary      Download a file
// @Tags         files
// @Produce      application/octet-stream
// @Param        file_id    query  int     true  "file id"
// @Param        file_name  query  string  true  "file name"
// @Success      200  {file}  file
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /file/download [get]
func DownloadUserFile(c *echo.Context, logger *zerolog.Logger, redis *redis.Client, s *storage.Storage, masterKey []byte) error {
	var downloadFileData downloadFileDTO
	ctx := c.Request().Context()
	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	if err := c.Bind(&downloadFileData); err != nil {
		logger.Err(err).Msg("Can't bind file_id")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	queries := sqlc.New(db.Pool)
	remoteID, err := queries.GetFileRemote(ctx, sqlc.GetFileRemoteParams{
		ID:       downloadFileData.FileID,
		UserID:   userID,
		Filename: downloadFileData.Filename,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "file not found")
		}
		logger.Err(err).Msg("failed to find remoteID by request")
		return echo.NewHTTPError(http.StatusInternalServerError, "internalServerError")
	}

	filename, err := queries.GetFileName(ctx, sqlc.GetFileNameParams{
		ID:       downloadFileData.FileID,
		UserID:   userID,
		RemoteID: remoteID,
	})
	if err != nil {
		logger.Err(err).Int32("file_id", downloadFileData.FileID).Msg("failed to get filename name of fileID")
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
	file, err := s.Read(remoteConnectionInfo, int(downloadFileData.FileID), filename)
	if err != nil {
		logger.Err(err).Int32("file_id", downloadFileData.FileID).Msg("failed to get file")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get file")
	}
	defer func() {
		if err := file.Close(); err != nil {
			logger.Err(err).Msg("failed to close file")
		}
	}()

	contentType := mime.TypeByExtension(filepath.Ext(filename))
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	c.Response().Header().Set(echo.HeaderContentDisposition, fmt.Sprintf(`attachment; filename="%s"`, quoteEscaper.Replace(filename)))
	return c.Stream(http.StatusOK, contentType, file)
}
