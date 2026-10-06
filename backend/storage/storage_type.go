package storage

import (
	"github.com/board-uai/clocess/db/sqlc"
	"github.com/rs/zerolog"
)

type Storage struct {
	Logger *zerolog.Logger
}

type RemoteConnection struct {
	UserID           int32
	RemoteID         int32
	RemoteHost       string
	RemotePort       int32
	RemoteUsername   string
	RemoteBasePath   string
	RemotePrivKey    []byte
	RemoteKeyVersion int16
}

func NewRemoteConnection(userID int32, remote sqlc.GetRemoteConnectionRow) RemoteConnection {
	return RemoteConnection{
		UserID:           userID,
		RemoteID:         remote.ID,
		RemoteHost:       remote.Host,
		RemotePort:       remote.Port,
		RemoteUsername:   remote.Username,
		RemoteBasePath:   remote.BasePath,
		RemotePrivKey:    remote.EncryptedPrivateKey,
		RemoteKeyVersion: remote.KeyVersion,
	}
}
