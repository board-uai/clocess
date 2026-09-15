package auth

import (
	"net/http"
	"net/mail"
	"strings"

	"github.com/labstack/echo/v5"
)

type userAuthDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// bindUserAuth takes json only, a plain form post from another site could otherwise sign a victim in
func bindUserAuth(c *echo.Context) (userAuthDTO, error) {
	var userData userAuthDTO
	if !strings.HasPrefix(c.Request().Header.Get(echo.HeaderContentType), echo.MIMEApplicationJSON) {
		return userData, echo.NewHTTPError(http.StatusBadRequest, "invalid body")
	}
	if err := c.Bind(&userData); err != nil {
		return userData, echo.NewHTTPError(http.StatusBadRequest, "invalid body")
	}
	return userData, nil
}

// the client sends the email trimmed and lowercased, anything else did not come from our form
func (u userAuthDTO) validateEmail() error {
	addr, err := mail.ParseAddress(u.Email)
	if err != nil || addr.Address != u.Email || strings.ToLower(u.Email) != u.Email {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid email")
	}
	return nil
}

func (u userAuthDTO) ValidateRegister() error {
	if err := u.validateEmail(); err != nil {
		return err
	}
	if len(u.Password) < 8 {
		return echo.NewHTTPError(http.StatusBadRequest, "password should be min 8 characters")
	}
	// bcrypt refuses anything longer
	if len(u.Password) > 72 {
		return echo.NewHTTPError(http.StatusBadRequest, "password is too long")
	}
	return nil
}

// ValidateLogin leaves the password rules to register, an old account may predate them
func (u userAuthDTO) ValidateLogin() error {
	return u.validateEmail()
}
