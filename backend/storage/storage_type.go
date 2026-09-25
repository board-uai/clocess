package storage

import (
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
