package remotes

import (
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/routes/remotes/utils"

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
func GetPublicKey(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	var remoteContext AddRemoteDTO
	ctx := c.Request().Context()

	// user id
	// BUG: userID discarded (_) — need it below to key the pending-key
	// storage (Redis, TTL) so add_remote can find the matching private key
	// this same user just got a public key for.
	_, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	// DEAD CODE: this is a GET route (see routes.go), and AddRemoteDTO has
	// only `json` tags, no `query` tags (compare downloadFileDTO's
	// `query:"file_id"` in files_DTO.go). c.Bind finds nothing to bind here
	// and remoteContext is never read afterwards — this whole block does
	// nothing. Either drop it, or this handler is meant to take no input at
	// all (matches what GenerateKeys actually needs: none).
	if err := c.Bind(&remoteContext); err != nil {
		logger.Err(err).Msg("Can't bind file_id")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}
	// BUG: private key half (_) is thrown away. Needs: encrypt with app
	// master key, stash in Redis under a key derived from userID (or a
	// fresh pending-remote token returned alongside publicClientKey), short
	// TTL — otherwise add_remote has no private key to authenticate with
	// when it tries to verify this remote later.
	_, publicClientKey, err := utils.GenerateKeys(logger)
	if err != nil {
		logger.Err(err).Msg("failed to generate tokens")
		return err
	}

	// remote_status.go
	return c.JSON(http.StatusOK, map[string]any{"publicClientKey": publicClientKey})
}
