include .env
export

# host port from compose.override.yaml postgres mapping
DB_URL := postgres://$(DB_USER):$(DB_PASSWORD)@127.0.0.1:$(DB_HOST_PORT)/$(DB_NAME)?sslmode=disable

migrate-up:
	goose -dir backend/db/migrations postgres "$(DB_URL)" up

migrate-down:
	goose -dir backend/db/migrations postgres "$(DB_URL)" down

migrate-create:
	goose -dir backend/db/migrations create $(name) sql

migrate-status:
	goose -dir backend/db/migrations postgres "$(DB_URL)" status


app-up:
	docker compose up -d 

app-down:
	docker compose down

app-build:
	docker compose up -d --build
