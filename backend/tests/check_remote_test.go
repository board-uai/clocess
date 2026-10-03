package tests

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/pem"
	"errors"
	"net"
	"testing"

	"github.com/board-uai/clocess/routes/remotes"
	"github.com/rs/zerolog"
	"golang.org/x/crypto/ssh"
)

// startSSHServer runs an SSH server that completes the handshake and rejects every channel,
// so CheckRemote gets past host-key verification and then fails on sftp.
func startSSHServer(t *testing.T) (remote remotes.AddRemoteDTO, fingerprint string) {
	t.Helper()
	_, hostKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	hostSigner, err := ssh.NewSignerFromKey(hostKey)
	if err != nil {
		t.Fatal(err)
	}
	config := &ssh.ServerConfig{
		PublicKeyCallback: func(ssh.ConnMetadata, ssh.PublicKey) (*ssh.Permissions, error) { return nil, nil },
	}
	config.AddHostKey(hostSigner)

	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = ln.Close() })
	go func() {
		for {
			conn, err := ln.Accept()
			if err != nil {
				return
			}
			go func() {
				_, chans, reqs, err := ssh.NewServerConn(conn, config)
				if err != nil {
					return
				}
				go ssh.DiscardRequests(reqs)
				for ch := range chans {
					_ = ch.Reject(ssh.Prohibited, "test server")
				}
			}()
		}
	}()

	port := ln.Addr().(*net.TCPAddr).Port
	return remotes.AddRemoteDTO{Host: "127.0.0.1", HostPort: int32(port), HostUser: "test", BasePath: "/tmp"},
		ssh.FingerprintSHA256(hostSigner.PublicKey())
}

func TestCheckRemoteHostKey(t *testing.T) {
	remote, fingerprint := startSSHServer(t)
	_, clientKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	block, err := ssh.MarshalPrivateKey(clientKey, "")
	if err != nil {
		t.Fatal(err)
	}
	privateKey := pem.EncodeToMemory(block)
	logger := zerolog.Nop()

	for _, tc := range []struct {
		name         string
		expected     string
		wantMismatch bool
	}{
		{"stored fingerprint differs", "SHA256:not-the-server-key", true},
		{"stored fingerprint matches", fingerprint, false},
		{"TOFU on add_remote", "", false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			_, err := remotes.CheckRemote(&remote, &logger, privateKey, tc.expected)
			if got := errors.Is(err, remotes.ErrHostKeyMismatch); got != tc.wantMismatch {
				t.Fatalf("ErrHostKeyMismatch = %v, want %v (err: %v)", got, tc.wantMismatch, err)
			}
		})
	}
}
