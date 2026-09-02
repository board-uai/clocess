package files

import (
	"mime/multipart"
)

type deleteFileDTO struct {
	FileID int32 `json:"file_id"`
}

type downloadFileDTO struct {
	FileID int32 `query:"file_id"`
}

type fileUploadDTO struct {
	File *multipart.FileHeader `form:"file"`
}
