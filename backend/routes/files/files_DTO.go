package files

import (
	"mime/multipart"
)

type deleteFileDTO struct {
	FileID   int32  `json:"file_id"`
	Filename string `json:"file_name"`
}

type downloadFileDTO struct {
	FileID   int32  `query:"file_id"`
	Filename string `query:"file_name"`
}

type fileUploadDTO struct {
	File     *multipart.FileHeader `form:"file"`
	RemoteId int32                 `form:"remote_id"`
}
