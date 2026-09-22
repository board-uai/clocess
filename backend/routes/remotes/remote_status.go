package remotes

import (
	"net"
	"strconv"

	"github.com/rs/zerolog"
)

func RemoteStatus(remoteContext *AddRemoteDTO, logger *zerolog.Logger, privateKey []byte) error {
	conn, err := net.Dial("tcp", net.JoinHostPort(remoteContext.Host, strconv.Itoa(int(remoteContext.HostPort))))
	if err != nil {
		logger.Err(err).Str("remote host", remoteContext.Host).Int16("remote port", remoteContext.HostPort).Msgf("cannot reach server")
		return err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			logger.Err(err).Str("remote host", remoteContext.Host).Int16("remote port", remoteContext.HostPort).Msg("cannot close connection with server")
		}
	}()

	return nil
}
