package remotes

import (
	"errors"
	"net"
	"path"
	"strconv"

	"github.com/pkg/sftp"
	"github.com/rs/zerolog"
	"golang.org/x/crypto/ssh"
)

var ErrHostKeyMismatch = errors.New("host key mismatch")

// CheckRemote does SSH auth, host-key verification, and a write/remove probe
// under BasePath to confirm it's actually writable.
//
// expectedFingerprint == "" is TOFU for a brand new remote: any key is accepted
// and its fingerprint returned for the caller to persist. Only add_remote may
// pass "". For an existing remote pass the stored fingerprint; a different host
// key fails with ErrHostKeyMismatch.
func CheckRemote(remoteContext *AddRemoteDTO, logger *zerolog.Logger, privateKey []byte, expectedFingerprint string) (fingerprint string, err error) {
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
			if expectedFingerprint != "" && fingerprint != expectedFingerprint {
				return ErrHostKeyMismatch
			}
			return nil
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
