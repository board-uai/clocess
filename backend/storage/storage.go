package storage

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
)

func (s Storage) Save(remoteConnectionInfo RemoteConnection, fileID int, filename string, src io.Reader) (diskPath string, err error) {
	filename = filepath.Base(filename)
	filePath := fmt.Sprintf("data/%d", remoteConnectionInfo.UserID)

	if err = os.MkdirAll(filePath, 0o750); err != nil {
		s.Logger.Err(err).Msg("failed to create directory")
		return "", err
	}

	fullPath := filepath.Join(filePath, fmt.Sprintf("%d_%s", fileID, filename))

	dst, err := os.OpenFile(fullPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o640)
	if err != nil {
		s.Logger.Err(err).Msg("failed to create file")
		return "", err
	}

	defer func() {
		if cerr := dst.Close(); cerr != nil && err == nil {
			err = cerr
			s.Logger.Err(cerr).Msg("failed to close file")
		}
	}()

	if _, err := io.Copy(dst, src); err != nil {
		s.Logger.Err(err).Msg("failed to write file")
		return "", err
	}

	return fullPath, nil
}

func (s Storage) Read(remoteConnectionInfo RemoteConnection, fileID int, filename string) (io.ReadCloser, error) {
	filename = filepath.Base(filename)
	fullPath := filepath.Join(fmt.Sprintf("data/%d", remoteConnectionInfo.UserID), fmt.Sprintf("%d_%s", fileID, filename))

	file, err := os.Open(fullPath)
	if err != nil {
		s.Logger.Err(err).Int("fileID", fileID).Msg("failed to open file")
		return nil, err
	}
	return file, nil
}

func (s Storage) DeleteFile(remoteConnectionInfo RemoteConnection, fileID int, filename string) error {
	filename = filepath.Base(filename)
	fullPath := filepath.Join(fmt.Sprintf("data/%d", remoteConnectionInfo.UserID), fmt.Sprintf("%d_%s", fileID, filename))

	if err := os.Remove(fullPath); err != nil {
		s.Logger.Err(err).Str("filePath", fullPath).Msg("failed to delete file")
		return err
	}
	return nil
}
