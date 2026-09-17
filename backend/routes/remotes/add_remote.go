package remotes

import (
	"net/http"

	"github.com/board-uai/clocess/cache"

	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

// on this moment, client already should have public key, from different endpoint
//
// AddUserRemote godoc
// @Summary      Add a remote server (SSH/SFTP) for the current user
// @Description  Client must already hold the public key returned by GET /remote/get_key. WIP: does not yet call CheckRemote or persist the row.
// @Tags         remotes
// @Accept       json
// @Param        body  body  AddRemoteDTO  true  "host, host_user, host_port, base_path, public_key"
// @Success      200
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Router       /remote/add_remote [post]
func AddUserRemote(c *echo.Context, logger *zerolog.Logger, redis *redis.Client) error {
	var remoteContext AddRemoteDTO
	ctx := c.Request().Context()

	// user id
	// BUG: userID discarded (_) — will need it twice: to pull the matching
	// pending private key that GetPublicKey stashed (keyed by userID, see
	// TODO there), and to fill remotes.user_id (NOT NULL FK) on insert.
	_, err := cache.GetUserIDFromSession(c, ctx, redis, logger)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	if err := c.Bind(&remoteContext); err != nil {
		logger.Err(err).Msg("Can't bind remote DTO")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	// remote_status.go
	// TODO: nothing below this point exists yet —
	//   1. look up the pending private key stashed by GetPublicKey (Redis,
	//      by userID) and confirm remoteContext.PublicKey actually matches
	//      the key generated for this user, not just any client-supplied
	//      string.
	//   2. call CheckRemote (currently only does a raw TCP dial — needs the
	//      SSH handshake/auth/host-key-pin/permission-probe layers before
	//      this is a real verification).
	//   3. on success: persist to remotes table (no sqlc queries exist for
	//      this table yet) and move the private key from Redis into
	//      remote_secrets, encrypted.
	// Right now this handler authenticates + validates shape and stops.
	return nil
}
