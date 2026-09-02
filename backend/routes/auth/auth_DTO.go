package auth

import (
	"net/http"
	"net/mail"

	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog"
)

type userAuthDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (u userAuthDTO) ValidateUserAuthInfo(logger *zerolog.Logger) error {
	if _, err := mail.ParseAddress(u.Email); err != nil {
		logger.Err(err).Str("email", u.Email).Msg("invalid email on register")
		return echo.NewHTTPError(http.StatusBadRequest, "invalid email")
	}

	if len(u.Password) < 8 {
		return echo.NewHTTPError(http.StatusBadRequest, "password should be min 8 characters")
	}

	return nil
}
