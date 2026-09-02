package files

import (
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
	"github.com/board-uai/clocess/storage"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

// DeleteFile godoc
// @Summary      Delete a file
// @Tags         files
// @Accept       json
// @Param        body  body  deleteFileDTO  true  "file_id"
// @Success      200
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /file/delete [post]
func DeleteFile(c *echo.Context, logger *zerolog.Logger, redis *redis.Client, s *storage.Storage) error {
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

	filename, err := queries.GetFileName(ctx, sqlc.GetFileNameParams{
		ID:     deleteFileRequest.FileID,
		UserID: userID,
	})
	if err != nil {
		logger.Err(err).Int32("file_id", deleteFileRequest.FileID).Msg("failed to get filename name of fileID")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get filename name of fileID")
	}

	if err := s.DeleteFile(int(userID), int(deleteFileRequest.FileID), filename); err != nil {
		logger.Err(err).Int32("file_id", deleteFileRequest.FileID).Msg("failed to delete file from disk")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete file")
	}

	if _, err := queries.DeleteFile(ctx, sqlc.DeleteFileParams{
		ID:     deleteFileRequest.FileID,
		UserID: userID,
	}); err != nil {
		logger.Err(err).Int32("file_id", deleteFileRequest.FileID).Msg("failed to delete file record")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete file")
	}
	return nil
}
