import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthFooter, AuthPage, Field, FormError, useAuthSubmit, useSession } from '@/auth'
import { login } from '@/lib/api'
import { Button } from '@/ui/Button'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refresh } = useSession()
  const from = (location.state as { from?: string } | null)?.from ?? '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { errors, pending, onSubmit } = useAuthSubmit(async () => {
    await login({ email, password })
    // the guard reads the provider, not the cookie, so it has to hear about this
    await refresh()
    navigate(from, { replace: true })
  })

  return (
    <AuthPage title="sign in" lead="">
      <form onSubmit={onSubmit} noValidate>
        {errors.form && <FormError>{errors.form}</FormError>}

        <div className="flex flex-col gap-5">
          <Field
            label="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            error={errors.email}
          />
          <Field
            label="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            error={errors.password}
            aside={
              <Link
                to="/forgot-password"
                className="font-mono text-[12px] text-ink-3 transition-colors hover:text-ink"
              >
                forgot?
              </Link>
            }
          />
        </div>

        <Button type="submit" disabled={pending} className="mt-6 h-12 w-full justify-center font-mono disabled:opacity-60">
          sign in
        </Button>
      </form>

      <AuthFooter>
        no account?{' '}
        <Link to="/register" className="text-ink transition-colors hover:text-ink-2">
          register
        </Link>
      </AuthFooter>
    </AuthPage>
  )
}
