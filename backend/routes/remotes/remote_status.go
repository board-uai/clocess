package remotes

import (
	"net"
	"strconv"

	"github.com/rs/zerolog"
)

// need to this more about this check, cause it can be used as an endpoint, but also a func which I would need when adding a new remote
//
// Only proves TCP reachability so far. Still missing, in order, before this
// can actually verify a remote:
//   - SSH handshake + auth (ssh.Dial with the per-remote signer) — this raw
//     net.Dial gets replaced by that, not layered under it.
//   - host key pinning (TOFU on first connect, compare on every later check).
//   - permission probe (stat base_path + write/delete a temp file) — SFTP
//     has no permission-check call, only proof-by-attempt.
func CheckRemote(remoteContext *AddRemoteDTO, logger *zerolog.Logger) error {
	conn, err := net.Dial("tcp", net.JoinHostPort(remoteContext.Host, strconv.Itoa(int(remoteContext.HostPort))))
	if err != nil {
		logger.Err(err).Str("remote host", remoteContext.Host).Int8("remote port", remoteContext.HostPort).Msgf("cannot reach server")
		return err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			logger.Err(err).Str("remote host", remoteContext.Host).Int8("remote port", remoteContext.HostPort).Msg("cannot close connection with server")
		}
	}()

	return nil
}
