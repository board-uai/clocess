package routes

import (
	"github.com/board-uai/clocess/routes/auth"
	"github.com/board-uai/clocess/routes/files"
	"github.com/board-uai/clocess/routes/settings"
	"github.com/board-uai/clocess/storage"
	"github.com/labstack/echo/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	httpSwagger "github.com/swaggo/http-swagger"
)

func SetupRoutes(api *echo.Group, logger *zerolog.Logger, redis *redis.Client, storage *storage.Storage) {
	// /health/[endpoint]
	Group(api, "/health", func(r *echo.Group) {
		r.GET("/ping", Ping)
	})

	api.GET("/swagger/*", echo.WrapHandler(httpSwagger.WrapHandler))

	// /user/[endpoint]
	Group(api, "/user", func(r *echo.Group) {
		r.POST("/create", func(c *echo.Context) error {
			return auth.RegisterUser(c, logger, redis)
		})

		r.POST("/login", func(c *echo.Context) error {
			return auth.LoginUser(c, logger, redis)
		})

		r.POST("/logout", func(c *echo.Context) error {
			return auth.LogoutUser(c, logger, redis)
		})

		r.GET("/me", func(c *echo.Context) error {
			return auth.GetUserInfo(c, logger, redis)
		})

		// user/settings/[endpoint]
		Group(r, "/settings", func(r *echo.Group) {
			r.POST("/deactivate", func(c *echo.Context) error {
				return settings.DeactivateUser(c, logger, redis)
			})

			r.PATCH("/change_password", func(c *echo.Context) error {
				return settings.ChangeUserPassword(c, logger, redis)
			})

		})
	})

	// file/[endpoint]
	Group(api, "/file", func(r *echo.Group) {
		r.GET("/get_all", func(c *echo.Context) error {
			return files.GetAllUserFiles(c, logger, redis)
		})

		r.POST("/delete", func(c *echo.Context) error {
			return files.DeleteFile(c, logger, redis, storage)
		})

		r.POST("/upload", func(c *echo.Context) error {
			return files.UploadUserFile(c, logger, redis, storage)
		})

		r.GET("/download", func(c *echo.Context) error {
			return files.DownloadUserFile(c, logger, redis, storage)
		})
	})
}
