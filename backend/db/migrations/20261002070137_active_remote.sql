-- +goose Up
alter table remotes
  add column active bool not null default true;

-- +goose Down
alter table remotes
  drop column active;
