package utils

import (
	"net"
	"path"
	"strconv"

	"github.com/board-uai/clocess/storage"
	"github.com/rs/zerolog"

	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
)

func RemoteStatusCheck(remoteContext *storage.RemoteConnection, logger *zerolog.Logger, privateKey []byte, serverFingerPrints string) error {
	signer, err := ssh.ParsePrivateKey(privateKey)
	if err != nil {
		logger.Err(err).Msg("failed to parse private Key")
		return err
	}

	clientConfig := &ssh.ClientConfig{
		User: remoteContext.RemoteUsername,
		Auth: []ssh.AuthMethod{ssh.PublicKeys(signer)},
		HostKeyCallback: func(hostname string, remote net.Addr, key ssh.PublicKey) error {
			fingerprint := ssh.FingerprintSHA256(key)
			if fingerprint != serverFingerPrints {
				// 403
				return nil
			}
			return nil // TOFU: first connect, nothing to compare against yet
		},
	}

	conn, err := ssh.Dial("tcp", net.JoinHostPort(remoteContext.RemoteHost, strconv.Itoa(int(remoteContext.RemotePort))), clientConfig)
	if err != nil {
		logger.Err(err).Str("remote host", remoteContext.RemoteHost).Int32("remote port", remoteContext.RemotePort).Msgf("cannot reach server")
		return err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			logger.Err(err).Str("remote host", remoteContext.RemoteHost).Int32("remote port", remoteContext.RemotePort).Msg("cannot close connection with server")
		}
	}()

	sftpClient, err := sftp.NewClient(conn)
	if err != nil {
		logger.Err(err).Msg("failed to open sftp session")
		return err
	}
	defer func() {
		if err := sftpClient.Close(); err != nil {
			logger.Err(err).Msg("cannot close sftp session")
		}
	}()

	probePath := path.Join(remoteContext.RemoteBasePath, ".clocess_write_probe")
	probeFile, err := sftpClient.Create(probePath)
	if err != nil {
		logger.Err(err).Str("path", probePath).Msg("base path not writable")
		return err
	}
	if _, err := probeFile.Write([]byte("ok")); err != nil {
		if err := probeFile.Close(); err != nil {
			logger.Err(err).Msg("failed to close probe file")
			return err
		}
		logger.Err(err).Str("path", probePath).Msg("base path not writable")
		return err
	}
	if err := probeFile.Close(); err != nil {
		logger.Err(err).Str("path", probePath).Msg("failed to close probe file")
		return err
	}
	if err := sftpClient.Remove(probePath); err != nil {
		logger.Err(err).Str("path", probePath).Msg("failed to remove probe file")
		return err
	}

	// here will be ping checks
	return nil
}
