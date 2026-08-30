package db

import (
	"context"
	"fmt"

	"github.com/board-uai/clocess/utils"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
)

var Pool *pgxpool.Pool

func Connect(ctx context.Context, env *utils.Env, logger *zerolog.Logger) error {
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		env.Get("DB_USER"), env.Get("DB_PASSWORD"), env.Get("DB_HOST"), env.Get("DB_PORT"), env.Get("DB_NAME"))

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		logger.Err(err).Msg("failed to create new pool")
		return err
	}
	if err := pool.Ping(ctx); err != nil {
		logger.Err(err).Msg("failed to ping db")
		return err
	}
	logger.Info().Msg("db connection has been initialized")

	Pool = pool
	return nil
}
