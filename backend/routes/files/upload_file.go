package files

import (
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"strings"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
	"github.com/board-uai/clocess/storage"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

// UploadUserFile godoc
// @Summary      Upload a file
// @Tags         files
// @Accept       multipart/form-data
// @Produce      json
// @Param        file  formData  file  true  "file to upload"
// @Success      200   {object}  map[string]any
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /file/upload [post]
func UploadUserFile(c *echo.Context, logger *zerolog.Logger, redis *redis.Client, s *storage.Storage) error {
	var fileUploadData fileUploadDTO
	ctx := c.Request().Context()
	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	if err := c.Bind(&fileUploadData); err != nil {
		logger.Err(err).Msg("Can't bind FileUploadStruct struct to request body")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}
	if fileUploadData.File == nil {
		logger.Err(err).Msg("Request came fileless")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}
	src, err := fileUploadData.File.Open()
	if err != nil {
		logger.Err(err).Msg("failed to open uploaded file")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}
	defer func() {
		if err := src.Close(); err != nil {
			s.Logger.Err(err).Msg("failed to close file")
		}
	}()

	queries := sqlc.New(db.Pool)

	file_id, err := queries.GetNextFileID(ctx)
	if err != nil {
		logger.Err(err).Msg("failed to get file_id")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to get file_id")
	}

	file_type, err := getFileType(src, s.Logger)
	if err != nil {
		logger.Err(err).Msg("failed to get file_type")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to analyze file_type")
	}

	file_path, err := s.Save(int(userID), int(file_id), fileUploadData.File.Filename, src)
	if err != nil {
		logger.Err(err).Int32("file_id", file_id).Msg("failed to save file on server")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to save file")
	}

	_, err = queries.CreateFileRecord(ctx, sqlc.CreateFileRecordParams{
		ID:       file_id,
		UserID:   userID,
		Filename: fileUploadData.File.Filename,
		FileType: file_type,
		DiskPath: file_path,
		RemoteID: 1, // we ll need to fix this later.
		// probably, automatically create a id=1 server as your machine
		// maybe skip the main server, and user always needs to add a server before saving any data files
	})
	if err != nil {
		logger.Err(err).Int32("file_id", file_id).Msg("failed to write record about new file")
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to write record about new file")
	}

	return c.JSON(http.StatusOK, map[string]any{"file_id": file_id, "file_path": file_path})
}

func getFileType(src multipart.File, logger *zerolog.Logger) (filetype string, err error) {
	buf := make([]byte, 512)
	n, err := src.Read(buf)
	if err != nil && !errors.Is(err, io.EOF) {
		return "", echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}
	mimeType := http.DetectContentType(buf[:n])
	if _, err := src.Seek(0, io.SeekStart); err != nil {
		logger.Err(err).Msg("failed to process file")
		return "", echo.NewHTTPError(http.StatusInternalServerError, "could process file")
	}
	filetype = mapMimeToCategory(mimeType)

	return filetype, nil
}

func mapMimeToCategory(mime string) string {
	switch {
	case strings.HasPrefix(mime, "image/"):
		return "image"
	case strings.HasPrefix(mime, "video/"):
		return "video"
	case strings.HasPrefix(mime, "audio/"):
		return "audio"
	case mime == "application/pdf", mime == "application/msword", strings.HasPrefix(mime, "text/"):
		return "document"
	default:
		return "other"
	}
}
