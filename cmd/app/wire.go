// app/wire.go
//go:build wireinject
// +build wireinject

package app

import (
	"context"

	"github.com/RudinMaxim/template/internal/config"
	"github.com/RudinMaxim/template/internal/infrastructure/database/postgres"
	"github.com/RudinMaxim/template/internal/infrastructure/database/redis"
	"github.com/RudinMaxim/template/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/google/wire"
)

func provideConfig() (*config.Config, error) {
	return config.LoadConfig()
}

func provideContext() context.Context {
	return context.Background()
}

func provideLogger(ctx context.Context, cfg *config.Config) (*logger.Logger, error) {
	return logger.NewLogger(ctx, "logs/app.log", logger.DefaultOptions())
}

func providePostgres(ctx context.Context, cfg *config.Config, logger *logger.Logger) (*postgres.Client, error) {
	dbConfig := &config.PostgresConfig{
		Host:            cfg.Postgres.Host,
		Port:            cfg.Postgres.Port,
		User:            cfg.Postgres.User,
		Password:        cfg.Postgres.Password,
		DBName:          cfg.Postgres.DBName,
		MaxIdleConns:    cfg.Postgres.MaxIdleConns,
		MaxOpenConns:    cfg.Postgres.MaxOpenConns,
		ConnMaxLifetime: cfg.Postgres.ConnMaxLifetime,
		ConnMaxIdleTime: cfg.Postgres.ConnMaxIdleTime,
		RetryAttempts:   cfg.Postgres.RetryAttempts,
		RetryDelay:      cfg.Postgres.RetryDelay,
		SSLMode:         cfg.Postgres.SSLMode,
		Debug:           cfg.Postgres.Debug,
	}
	return postgres.NewClient(ctx, dbConfig, logger)
}

func provideRedis(ctx context.Context, cfg *config.Config, logger *logger.Logger) (*redis.Client, error) {
	cacheConfig := &config.RedisConfig{
		Host:         cfg.Redis.Host,
		Port:         cfg.Redis.Port,
		Password:     cfg.Redis.Password,
		DB:           cfg.Redis.DB,
		PoolSize:     cfg.Redis.PoolSize,
		MinIdleConns: cfg.Redis.MinIdleConns,
		Enabled:      cfg.Redis.Enabled,
		DefaultTTL:   cfg.Redis.DefaultTTL,
		OrderTTL:     cfg.Redis.OrderTTL,
	}
	return redis.NewClient(ctx, cacheConfig, logger)
}

func provideRouter() *gin.Engine {
	return gin.Default()
}

func provideApp(
	ctx context.Context,
	cfg *config.Config,
	logger *logger.Logger,
	postgres *postgres.Client,
	redis *redis.Client,
	router *gin.Engine,
) *App {
	return &App{
		ctx:      ctx,
		config:   cfg,
		logger:   logger,
		postgres: postgres,
		redis:    redis,
		router:   router,
	}
}

func InitializeApp() (*App, func(), error) {
	panic(wire.Build(
		provideContext,
		provideConfig,
		provideLogger,
		providePostgres,
		provideRedis,
		provideRouter,
		provideApp,
	))
}