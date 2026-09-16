import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '@/lib/api'

export interface AuthErrors {
  email?: ReactNode
  password?: ReactNode
  form?: ReactNode
}

/** the server's own words, filed under the field that caused them */
function errorsFor(err: unknown): AuthErrors {
  if (!(err instanceof ApiError)) return { form: 'the server did not answer, try again' }

  switch (err.status) {
    case 400:
      if (err.message === 'invalid email') return { email: err.message }
      if (err.message.startsWith('password')) return { password: err.message }
      return { form: err.message }
    // deliberately one message, splitting it would tell anyone who has an account
    case 401:
      return { password: 'email or password is wrong' }
    case 409:
      return {
        email: (
          <>
            {err.message} ·{' '}
            <Link to="/login" className="text-ink transition-colors hover:text-ink-2">
              sign in
            </Link>
          </>
        ),
      }
    case 429:
      return { form: 'too many attempts, wait a minute and try again' }
    default:
      return { form: err.message }
  }
}

/** runs one auth call, keeps it from running twice, and places its failure */
export function useAuthSubmit(action: () => Promise<void>) {
  const [errors, setErrors] = useState<AuthErrors>({})
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (pending) return

    setErrors({})
    setPending(true)
    try {
      await action()
    } catch (err) {
      setErrors(errorsFor(err))
    } finally {
      setPending(false)
    }
  }

  return { errors, pending, onSubmit }
}
