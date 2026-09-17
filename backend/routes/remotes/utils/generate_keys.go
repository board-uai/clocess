package utils

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"

	"github.com/rs/zerolog"
	"golang.org/x/crypto/ssh"
)

// GenerateKeys returns (privateKeyPEM, publicKeyAuthorized, error).
// publicKeyAuthorized is the "ssh-rsa ..." line — safe to hand to the client.
func GenerateKeys(logger *zerolog.Logger) (privateKeyClient []byte, publicKeyClient []byte, error error) {
	bitSize := 4096
	privateKey, err := generatePrivateKey(bitSize, logger)
	if err != nil {
		// logs already ll be handled in func
		return nil, nil, err
	}

	publicKeyBytes, err := generatePublicKey(&privateKey.PublicKey, logger)
	if err != nil {
		return nil, nil, err
	}

	privateKeyPEM := encodePrivateKeyToPEM(privateKey)

	return privateKeyPEM, publicKeyBytes, nil
}

func generatePrivateKey(bitSize int, logger *zerolog.Logger) (*rsa.PrivateKey, error) {
	// Private Key generation
	privateKey, err := rsa.GenerateKey(rand.Reader, bitSize)
	if err != nil {
		logger.Err(err).Msg("failed to generate private key")
		return nil, err
	}

	// Validate Private Key
	err = privateKey.Validate()
	if err != nil {
		logger.Err(err).Msg("failed to validate private key")
		return nil, err
	}

	return privateKey, nil
}

// encodePrivateKeyToPEM encodes Private Key from RSA to PEM format
func encodePrivateKeyToPEM(privateKey *rsa.PrivateKey) []byte {
	// Get ASN.1 DER format
	privDER := x509.MarshalPKCS1PrivateKey(privateKey)

	// pem.Block
	privBlock := pem.Block{
		Type:    "RSA PRIVATE KEY",
		Headers: nil,
		Bytes:   privDER,
	}

	// Private key in PEM format
	privatePEM := pem.EncodeToMemory(&privBlock)

	return privatePEM
}

// generatePublicKey take a rsa.PublicKey and return bytes suitable for writing to .pub file returns in the format "ssh-rsa ..."
func generatePublicKey(privateKey *rsa.PublicKey, logger *zerolog.Logger) ([]byte, error) {
	publicRsaKey, err := ssh.NewPublicKey(privateKey)
	if err != nil {
		logger.Err(err).Msg("failed to generate public key")
		return nil, err
	}

	pubKeyBytes := ssh.MarshalAuthorizedKey(publicRsaKey)

	return pubKeyBytes, nil
}
