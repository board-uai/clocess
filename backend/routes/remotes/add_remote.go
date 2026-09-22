package remotes

import (
	"net/http"
	"strings"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"
	crypt "github.com/board-uai/clocess/utils"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

// AddUserRemote godoc
// @Summary      Add a remote server (SSH/SFTP) for the current user
// @Description  Client must already hold the public key returned by GET /remote/get_key.
// @Tags         remotes
// @Accept       json
// @Param        body  body  AddRemoteDTO  true  "host, host_user, host_port, base_path, public_key"
// @Success      200
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Router       /remote/add_remote [post]
func AddUserRemote(c *echo.Context, logger *zerolog.Logger, redis *redis.Client, masterKey []byte) error {
	var remoteContext AddRemoteDTO
	ctx := c.Request().Context()

	userID, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	if err := c.Bind(&remoteContext); err != nil {
		logger.Err(err).Msg("Can't bind remote DTO")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	sessionData, err := cache.GetSessionData(c, redis, logger)
	if err != nil {
		return err
	}

	publicKey := strings.TrimSpace(sessionData["publicKey"])
	if strings.TrimSpace(remoteContext.PublicKey) != publicKey {
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}
	decryptPrivateKey, err := crypt.DecryptMaster(masterKey, []byte(sessionData["privateKey"]))
	if err != nil {
		logger.Err(err).Msg("failed to decrypt private Key")
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	fingerprints, err := CheckRemote(&remoteContext, logger, decryptPrivateKey)
	if err != nil {
		logger.Err(err).Msg("failed to check remote")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	queries := sqlc.New(db.Pool)
	remoteID, err := queries.CreateRemote(ctx, sqlc.CreateRemoteParams{
		UserID:             userID,
		Host:               remoteContext.Host,
		Port:               remoteContext.HostPort,
		Username:           remoteContext.HostUser,
		BasePath:           remoteContext.BasePath,
		PublicKey:          publicKey,
		HostKeyFingerprint: pgtype.Text{String: fingerprints, Valid: true},
	})
	if err != nil {
		logger.Err(err).Msg("failed to create a record for remote in db")
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	_, err = queries.CreateRemoteSecret(ctx, sqlc.CreateRemoteSecretParams{
		RemoteID:            pgtype.Int4{Int32: remoteID, Valid: true},
		EncryptedPrivateKey: []byte(sessionData["privateKey"]),
		KeyVersion:          1,
	})
	if err != nil {
		logger.Err(err).Msg("failed to create a record for remote secret in db")
		return echo.NewHTTPError(http.StatusInternalServerError, "internal server error")
	}

	return nil
}
