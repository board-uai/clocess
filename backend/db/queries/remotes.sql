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


-- name: DeactivateUserRemote :exec
WITH deactivated_remote AS (
    UPDATE remotes 
    SET active = false 
    WHERE remotes.id = $1 AND remotes.user_id = $2
    RETURNING remotes.id AS cte_id
)
DELETE FROM remote_secrets 
WHERE remote_secrets.remote_id IN (SELECT cte_id FROM deactivated_remote);


-- name: DeleteUserRemote :exec
WITH target_remote AS (
    SELECT remotes.id AS cte_id FROM remotes 
    WHERE remotes.id = $1 AND remotes.user_id = $2
)
, deleted_secret AS (
    DELETE FROM remote_secrets 
    WHERE remote_secrets.remote_id IN (SELECT cte_id FROM target_remote)
)
DELETE FROM remotes 
WHERE remotes.id IN (SELECT cte_id FROM target_remote);
