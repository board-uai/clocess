import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthPage, Field, FormError, Status, forgetEmail, rememberedEmail, useAuthSubmit, useSession } from '@clocess/shared/auth'
import { login } from '@clocess/shared/api'
import { Button } from '@clocess/shared/ui'

/** where a guarded page lands once its session died, the email is already known */
export function SignedOut() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refresh } = useSession()
  const from = (location.state as { from?: string } | null)?.from ?? '/account'

  const [email] = useState(rememberedEmail)
  const [password, setPassword] = useState('')

  const { errors, pending, onSubmit } = useAuthSubmit(async () => {
    await login({ email: email ?? '', password })
    await refresh()
    navigate(from, { replace: true })
  })

  if (!email) return <Navigate to="/login" replace state={location.state} />

  function notYou() {
    forgetEmail()
    navigate('/login', { replace: true, state: location.state })
  }

  // there is no email field here, so its error goes up top with the rest
  const formError = errors.form ?? errors.email

  return (
    <AuthPage
      status={<Status tone="bad">invalid session</Status>}
      title="you were signed out"
      lead="sessions last 24 h and there is no refresh. your machines never stopped, only this browser lost its cookie."
    >
      <form onSubmit={onSubmit} noValidate>
        {formError && <FormError>{formError}</FormError>}

        {/* lets the password manager match the saved login */}
        <input type="email" value={email} autoComplete="username" readOnly hidden />

        <Field
          label="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
          error={errors.password}
          hint={
            <>
              signed in as {email} ·{' '}
              <button type="button" onClick={notYou} className="text-ink-2 transition-colors hover:text-ink">
                not you?
              </button>
            </>
          }
        />

        <Button type="submit" disabled={pending} className="mt-6 h-12 w-full justify-center font-mono disabled:opacity-60">
          sign back in
        </Button>
      </form>
    </AuthPage>
  )
}
