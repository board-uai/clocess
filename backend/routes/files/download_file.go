package files

import (
	"fmt"
	"mime"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
	"github.com/board-uai/clocess/storage"

	"github.com/board-uai/clocess/cache"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

type downloadFileRequest struct {
	FileID int32 `query:"file_id"`
}

var quoteEscaper = strings.NewReplacer(`\`, `\\`, `"`, `\"`)

// DownloadUserFile godoc
// @Summary      Download a file
// @Tags         files
// @Produce      application/octet-stream
// @Param        file_id  query  int  true  "file id"
// @Success      200  {file}  file
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /file/download [get]
func DownloadUserFile(c *echo.Context, logger *zerolog.Logger, redis *redis.Client, s *storage.Storage) error {
	var downloadFileData downloadFileRequest
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
	filename, err := queries.GetFileName(ctx, sqlc.GetFileNameParams{
		ID:     downloadFileData.FileID,
		UserID: userID,
	})
	if err != nil {
		logger.Err(err).Int32("file_id", downloadFileData.FileID).Msg("failed to get filename name of fileID")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get filename name of fileID")
	}

	file, err := s.Read(int(userID), int(downloadFileData.FileID), filename)
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
