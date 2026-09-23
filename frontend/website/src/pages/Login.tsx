import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthFooter, AuthPage, Field, FormError, useAuthSubmit, useSession } from '@clocess/shared/auth'
import { login } from '@clocess/shared/api'
import { Button } from '@clocess/shared/ui'

export function Login() {
  const [searchParams] = useSearchParams()
  const { refresh } = useSession()
  const from = searchParams.get('from') ?? '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { errors, pending, onSubmit } = useAuthSubmit(async () => {
    await login({ email, password })
    // the guard reads the provider, not the cookie, so it has to hear about this
    await refresh()
    window.location.href = `${import.meta.env.VITE_APP_URL}${from}`
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
