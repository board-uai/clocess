-- +goose Up
-- deleting a remote must not silently drop the file rows on it (blobs would be orphaned)
alter table files
  drop constraint files_remote_id_fkey,
  add constraint files_remote_id_fkey foreign key (remote_id) references remotes(id);

-- +goose Down
alter table files
  drop constraint files_remote_id_fkey,
  add constraint files_remote_id_fkey foreign key (remote_id) references remotes(id) on delete cascade;