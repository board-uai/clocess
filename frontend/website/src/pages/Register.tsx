import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthFooter, AuthPage, Field, FormError, useAuthSubmit, useSession } from '@clocess/shared/auth'
import { register } from '@clocess/shared/api'
import { Button } from '@clocess/shared/ui'

export function Register() {
  const { refresh } = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { errors, pending, onSubmit } = useAuthSubmit(async () => {
    await register({ email, password })
    // the server already started a session, sending them to sign in again would ask twice
    await refresh()
    window.location.href = `${import.meta.env.VITE_APP_URL}/account`
  })

  return (
    <AuthPage
      title="make an account"
      lead=""
    >
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
            autoComplete="new-password"
            hint="min 8 characters"
            error={errors.password}
          />
        </div>

        <Button type="submit" disabled={pending} className="mt-6 h-12 w-full justify-center font-mono disabled:opacity-60">
          create account
        </Button>
      </form>

      <AuthFooter>
        already have one?{' '}
        <Link to="/login" className="text-ink transition-colors hover:text-ink-2">
          sign in
        </Link>
      </AuthFooter>
    </AuthPage>
  )
}
