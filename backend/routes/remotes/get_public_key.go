package remotes

import (
	"net/http"
	"time"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/routes/remotes/utils"
	crypt "github.com/board-uai/clocess/utils"

	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

// GetPublicKey godoc
// @Summary      Generate a keypair for a new remote and return the public half
// @Description  Private key stays server-side and never leaves this handler as-is (see TODO below); client only ever gets the public key to paste into their server's authorized_keys.
// @Tags         remotes
// @Success      200  {object}  map[string]any  "publicClientKey"
// @Failure      401  {object}  map[string]string  "invalid session"
// @Failure      500  {object}  map[string]string
// @Router       /remote/get_key [get]
func GetPublicKey(c *echo.Context, logger *zerolog.Logger, redis *redis.Client, masterKey []byte) error {
	ctx := c.Request().Context()
	if _, err := cache.GetUserIDFromSession(c, ctx, redis, logger); err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	privateClientKey, publicClientKey, err := utils.GenerateKeys(logger)
	if err != nil {
		logger.Err(err).Msg("failed to generate tokens")
		return err
	}
	encryptedPrivateKey, err := crypt.EncryptMaster(masterKey, privateClientKey)
	if err != nil {
		logger.Err(err).Msg("failed to encrypt private key")
		return echo.NewHTTPError(http.StatusInternalServerError, "internal error")
	}

	if err := cache.AddDataToSession(
		c, redis,
		logger, map[string]string{"publicKey": string(publicClientKey), "privateKey": string(encryptedPrivateKey)},
		10*time.Minute,
	); err != nil {
		logger.Err(err).Msg("failed to stash pending private key")
		return echo.NewHTTPError(http.StatusInternalServerError, "internal error")
	}

	return c.JSON(http.StatusOK, map[string]any{"publicClientKey": string(publicClientKey)})
}
