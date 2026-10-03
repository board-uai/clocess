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
// @Param        file_id  query  int  true  "file id"
// @Success      200  {file}  file
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      409  {object}  map[string]string  "file's remote has no stored key"
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
	userFile, err := queries.GetUserFile(ctx, sqlc.GetUserFileParams{
		ID:     downloadFileData.FileID,
		UserID: userID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "file not found")
		}
		logger.Err(err).Int32("file_id", downloadFileData.FileID).Msg("failed to get file")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get file")
	}
	filename := userFile.Filename

	remoteInfo, err := queries.GetRemoteConnection(ctx, sqlc.GetRemoteConnectionParams{
		ID:     userFile.RemoteID,
		UserID: userID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusConflict, "file's remote has no stored key")
		}
		logger.Err(err).Int32("remote_id", userFile.RemoteID).Msg("failed to get remote connection info")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get remote connection info")
	}

	file, err := s.Read(storage.NewRemoteConnection(userID, remoteInfo), int(downloadFileData.FileID), filename)
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
