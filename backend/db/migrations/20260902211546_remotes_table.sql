-- +goose Up
CREATE TABLE remotes (
  id SERIAL PRIMARY KEY,
  user_id integer not null references users(id) on delete cascade,
  host text not null,
  port integer not null,
  username text not null,
  base_path text not null,
  public_key text not null,
  host_key_fingerprint text,
  created_at TIMESTAMPTZ not null DEFAULT now()
);

CREATE INDEX idx_remotes_user_id ON remotes(user_id);

-- +goose Down
drop table remotes;
