-- +goose Up
alter table files
  add column remote_id integer not null references remotes(id) on delete cascade;

CREATE INDEX idx_file_to_remote ON files(remote_id);


-- +goose Down
alter table files
  drop column remote_id;
