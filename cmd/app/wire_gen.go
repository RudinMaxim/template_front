// Code generated by Wire. DO NOT EDIT.

//go:generate go run -mod=mod github.com/google/wire/cmd/wire
//go:build !wireinject
// +build !wireinject

package app

import (
	"context"
	"github.com/RudinMaxim/template/internal/config"
	"github.com/RudinMaxim/template/internal/infrastructure/database/postgres"
	"github.com/RudinMaxim/template/internal/infrastructure/database/redis"
	"github.com/RudinMaxim/template/pkg/logger"
	"github.com/gin-gonic/gin"
)

// Injectors from wire.go:

func InitializeApp() (*App, func(), error) {
	context := provideContext()
	config, err := provideConfig()
	if err != nil {
		return nil, nil, err
	}
	logger, err := provideLogger(context, config)
	if err != nil {
		return nil, nil, err
	}
	client, err := providePostgres(context, config, logger)
	if err != nil {
		return nil, nil, err
	}
	redisClient, err := provideRedis(context, config, logger)
	if err != nil {
		return nil, nil, err
	}
	engine := provideRouter()
	app := provideApp(context, config, logger, client, redisClient, engine)
	return app, func() {
	}, nil
}

// wire.go:

func provideConfig() (*config.Config, error) {
	return config.LoadConfig()
}

func provideContext() context.Context {
	return context.Background()
}

func provideLogger(ctx context.Context, cfg *config.Config) (*logger.Logger, error) {
	return logger.NewLogger(ctx, "logs/app.log", logger.DefaultOptions())
}

func providePostgres(ctx context.Context, cfg *config.Config, logger2 *logger.Logger) (*postgres.Client, error) {
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
	return postgres.NewClient(ctx, dbConfig, logger2)
}

func provideRedis(ctx context.Context, cfg *config.Config, logger2 *logger.Logger) (*redis.Client, error) {
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
	return redis.NewClient(ctx, cacheConfig, logger2)
}

func provideRouter() *gin.Engine {
	return gin.Default()
}

func provideApp(
	ctx context.Context,
	cfg *config.Config, logger2 *logger.Logger, postgres2 *postgres.Client, redis2 *redis.Client,
	router *gin.Engine,
) *App {
	return &App{
		ctx:      ctx,
		config:   cfg,
		logger:   logger2,
		postgres: postgres2,
		redis:    redis2,
		router:   router,
	}
}