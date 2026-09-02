-- name: GetAllUserFiles :many
select id, filename, file_type from files where user_id = $1;


-- name: DeleteFile :one
delete from files where id = $1 and user_id = $2
returning filename;

-- name: GetFileName :one
select filename from files where id = $1 and user_id = $2;

-- name: GetNextFileID :one
select nextval('files_id_seq')::int;


-- name: CreateFileRecord :one
insert into files (id, user_id, filename, file_type, disk_path, remote_id)
  values ($1, $2, $3, $4, $5, $6)
  returning id;
