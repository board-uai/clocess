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
// @Param        body  body  deleteFileDTO  true  "file_id"
// @Success      200
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      409  {object}  map[string]string  "file's remote has no stored key"
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
	userFile, err := queries.GetUserFile(ctx, sqlc.GetUserFileParams{
		ID:     deleteFileRequest.FileID,
		UserID: userID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return echo.NewHTTPError(http.StatusNotFound, "file not found")
		}
		logger.Err(err).Int32("file_id", deleteFileRequest.FileID).Msg("failed to get file")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get file")
	}

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

	if err := s.DeleteFile(storage.NewRemoteConnection(userID, remoteInfo), int(deleteFileRequest.FileID), userFile.Filename); err != nil {
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
