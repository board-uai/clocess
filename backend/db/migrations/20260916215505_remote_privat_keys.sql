-- +goose Up
CREATE TABLE remote_secrets (
  id SERIAL PRIMARY KEY,
  remote_id integer  REFERENCES remotes(id) ON DELETE CASCADE, 
  encrypted_private_key bytea NOT NULL,  
  key_version smallint NOT NULL DEFAULT 1
);

CREATE INDEX idx_secret_to_remote ON remote_secrets(remote_id);

-- +goose Down
DROP TABLE remote_secrets;
