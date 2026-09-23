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

-- name: GetAllUserRemotes :many
SELECT id, host, port, username, base_path FROM remotes WHERE user_id = $1;

-- name: GetRemoteById :one
SELECT id, host, port, username, base_path FROM remotes WHERE user_id = $1 AND id = $2;


SELECT id, host_key_fingerprint FROM remotes WHERE user_id = $1 AND id = $2;

-- name: GetServerConnectionInfo :many
SELECT 
    remotes.id, 
    remotes.host, 
    remotes.port, 
    remotes.username, 
    remotes.base_path,
    remote_secrets.encrypted_private_key, 
    remote_secrets.key_version 
FROM remotes
INNER JOIN remote_secrets 
    ON remotes.id = remote_secrets.remote_id;
