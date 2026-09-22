package remotes

import (
	"net"
	"path"
	"strconv"

	"github.com/pkg/sftp"
	"github.com/rs/zerolog"
	"golang.org/x/crypto/ssh"
)

// CheckRemote does first-connect verification for a brand new remote: SSH
// auth, TOFU host-key capture (nothing to compare against yet, so any key is
// accepted and its fingerprint returned for the caller to persist), and a
// write/remove probe under BasePath to confirm it's actually writable.
//
// Reconnect (verifying against an *already-stored* fingerprint once a remote
// exists) is a separate, not-yet-written code path — do not reuse this func
// for that; it always trusts the first key it sees.
func CheckRemote(remoteContext *AddRemoteDTO, logger *zerolog.Logger, privateKey []byte) (fingerprint string, err error) {
	signer, err := ssh.ParsePrivateKey(privateKey)
	if err != nil {
		logger.Err(err).Msg("failed to parse private Key")
		return "", err
	}

	clientConfig := &ssh.ClientConfig{
		User: remoteContext.HostUser,
		Auth: []ssh.AuthMethod{ssh.PublicKeys(signer)},
		HostKeyCallback: func(hostname string, remote net.Addr, key ssh.PublicKey) error {
			fingerprint = ssh.FingerprintSHA256(key)
			return nil // TOFU: first connect, nothing to compare against yet
		},
	}

	conn, err := ssh.Dial("tcp", net.JoinHostPort(remoteContext.Host, strconv.Itoa(int(remoteContext.HostPort))), clientConfig)
	if err != nil {
		logger.Err(err).Str("remote host", remoteContext.Host).Int32("remote port", remoteContext.HostPort).Msgf("cannot reach server")
		return "", err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			logger.Err(err).Str("remote host", remoteContext.Host).Int32("remote port", remoteContext.HostPort).Msg("cannot close connection with server")
		}
	}()

	sftpClient, err := sftp.NewClient(conn)
	if err != nil {
		logger.Err(err).Msg("failed to open sftp session")
		return "", err
	}
	defer func() {
		if err := sftpClient.Close(); err != nil {
			logger.Err(err).Msg("cannot close sftp session")
		}
	}()

	probePath := path.Join(remoteContext.BasePath, ".clocess_write_probe")
	probeFile, err := sftpClient.Create(probePath)
	if err != nil {
		logger.Err(err).Str("path", probePath).Msg("base path not writable")
		return "", err
	}
	if _, err := probeFile.Write([]byte("ok")); err != nil {
		if err := probeFile.Close(); err != nil {
			logger.Err(err).Msg("failed to close probe file")
			return "", err
		}
		logger.Err(err).Str("path", probePath).Msg("base path not writable")
		return "", err
	}
	if err := probeFile.Close(); err != nil {
		logger.Err(err).Str("path", probePath).Msg("failed to close probe file")
		return "", err
	}
	if err := sftpClient.Remove(probePath); err != nil {
		logger.Err(err).Str("path", probePath).Msg("failed to remove probe file")
		return "", err
	}

	return fingerprint, nil
}
