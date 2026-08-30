-- +goose Up
alter table users
  add column username text not null;

-- +goose Down
alter table users
  drop column username;
