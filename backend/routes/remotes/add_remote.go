package remotes

import (
	"net/http"

	"github.com/board-uai/clocess/cache"
	"github.com/board-uai/clocess/db"
	"github.com/board-uai/clocess/db/sqlc"

	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

// AddUserRemote godoc
// @Summary      Add a remote server (SSH/SFTP) for the current user
// @Description  Client must already hold the public key returned by GET /remote/get_key. WIP: now calls CheckRemote and persists a row, but see the inline notes below — the public-key check, error handling, and CheckRemote itself are all still broken/incomplete.
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

	if remoteContext.PublicKey != sessionData["publicKey"] {
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	// INCOMPLETE: two things here —
	//   2. CheckRemote itself (remote_status.go) is still just a raw TCP
	//      dial — no SSH auth, no host-key pinning, no permission probe.
	//      A 200 here doesn't yet mean the remote is actually usable.
	if err := CheckRemote(&remoteContext, logger); err != nil {
		logger.Err(err).Msg("failed to check remote")
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	queries := sqlc.New(db.Pool)
	// BROKEN: err from CreateRemote is never checked — if the insert fails,
	// remoteID is left at its zero value and execution falls straight
	// through into CreateRemoteSecret below using that bad id anyway.
	//
	// HostKeyFingerprint is left unset (nullable column, so this compiles)
	// because nothing produces a fingerprint yet — that's Stage 1's TOFU
	// host-key pinning, not implemented in CheckRemote/remote_status.go.
	// Every remote persisted right now gets a null fingerprint.
	_, err = queries.CreateRemote(ctx, sqlc.CreateRemoteParams{
		UserID:    userID,
		Host:      remoteContext.Host,
		Port:      int32(remoteContext.HostPort),
		Username:  remoteContext.HostUser,
		BasePath:  remoteContext.BasePath,
		PublicKey: sessionData["publicKey"],
		// HostKeyFingerprint: ,
	})
	if err != nil {
		logger.Err(err).Msg("failed to create a record for remote in db")
		return nil
	}

	// BUILD BROKEN: RemoteID wants a pgtype.Int4 (see CreateRemoteSecretParams
	// in db/sqlc/remotes.sql.go), not a plain int — `go build` fails here:
	// "cannot use int(remoteID) (value of type int) as pgtype.Int4 value".
	//
	// Also: KeyVersion isn't set in this literal, so it's sent as 0 —
	// remote_secrets.key_version is NOT NULL DEFAULT 1, but this is a bound
	// parameter, not an omitted column, so the DB default never kicks in;
	// every row gets key_version=0 instead of 1.
	//
	// And: this err is never checked at all (assigned, never read) — the
	// function falls through to `return nil` below regardless of whether
	// either insert actually succeeded.
	_, err = queries.CreateRemoteSecret(ctx, sqlc.CreateRemoteSecretParams{
		// RemoteID:            int(remoteID),
		EncryptedPrivateKey: []byte(sessionData["privateKey"]),
	})
	if err != nil {
		logger.Err(err).Msg("failed to create a record for remote secret in db")
		return nil
	}

	// CURRENT STATE (all three original TODO items are now attempted, none
	// are done correctly yet — see the inline notes above each one):
	//   1. public-key match check exists but compares against the wrong
	//      (and misspelled) map key — always rejects right now.
	//   2. CheckRemote is called, but it's still remote_status.go's raw TCP
	//      dial stub — no real SSH/host-key/permission verification.
	//   3. CreateRemote + CreateRemoteSecret are both called, but: the file
	//      doesn't currently build (unused imports + a pgtype.Int4 type
	//      mismatch), neither call's error is checked, and this function
	//      always returns nil at the end regardless of what happened above
	//      — a caller gets 200 even on a failed insert.
	return nil
}
