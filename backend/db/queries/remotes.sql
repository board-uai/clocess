-- name: CreateRemoteSecret :one
INSERT into remote_secrets(remote_id, encrypted_private_key, key_version)
  values ($1, $2, $3)
  returning id;


-- name: GetRemoteSecret :many
SELECT remote_id, encrypted_private_key, key_version FROM remote_secrets where remote_id = $1;

-- name: CreateRemote :one
INSERT into remotes(user_id, host, port, username, base_path, public_key, host_key_fingerprint)
  values ($1, $2, $3, $4, $5, $6, $7)
  returning id;

-- name: GetUserRemotes :many
SELECT id, host, port, username, base_path FROM remotes WHERE user_id = $1 and active=true;

-- name: GetAllUserRemotes :many
SELECT id, host, port, username, base_path FROM remotes WHERE user_id = $1;

-- name: GetRemoteConnection :one
SELECT
    remotes.id,
    remotes.host,
    remotes.port,
    remotes.username,
    remotes.base_path,
    remotes.host_key_fingerprint,
    remote_secrets.encrypted_private_key,
    remote_secrets.key_version
FROM remotes
INNER JOIN remote_secrets
    ON remote_secrets.remote_id = remotes.id
WHERE remotes.id = $1 AND remotes.user_id = $2;

-- name: DeactivateUserRemote :execrows
WITH deleted_secret AS (
    DELETE FROM remote_secrets
    WHERE remote_secrets.remote_id IN (
        SELECT remotes.id FROM remotes WHERE remotes.id = $1 AND remotes.user_id = $2
    )
)
UPDATE remotes
SET active = false
WHERE remotes.id = $1 AND remotes.user_id = $2;

-- name: DeleteUserRemote :execrows
DELETE FROM remotes WHERE id = $1 AND user_id = $2;
