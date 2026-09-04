import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Button } from '@/ui/Button'
import type { Credentials } from '@/lib/api'

interface AuthFormProps {
  /** sits above the fields */
  title: string
  /** label on the submit button */
  action: string
  /** current-password when signing in, new-password when registering */
  autoComplete: 'current-password' | 'new-password'
  /** adds the repeat field, the server has no idea about it so it is checked here */
  confirm?: boolean
  /** does the request, rejects with a message worth showing */
  onSubmit: (credentials: Credentials) => Promise<void>
  /** the way over to the other auth page */
  footer: ReactNode
}

const FIELD =
    'w-full rounded-md border border-ink-3 bg-transparent px-4 py-3 text-[17px] text-ink transition-colors placeholder:text-ink-3 focus:border-ink-2'

const LABEL = 'mb-2 block text-[15px] text-ink-2 border-width: 10px'

export function AuthForm({
  title,
  action,
  autoComplete,
  confirm = false,
  onSubmit,
  footer,
}: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (pending) return

    if (confirm && password !== repeat) {
      setError('the passwords do not match')
      return
    }

    setError(null)
    setPending(true)
    try {
      await onSubmit({ email, password })
    } catch (err) {
      // everything else is the server's call, it validates both fields already
      setError(err instanceof Error ? err.message : 'something went wrong')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-100">
      <h1 className="mb-8 text-center text-[22px] text-ink">{title}</h1>

      <div className="flex flex-col gap-4">
        <label className="block">
          <span className={LABEL}>email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className={FIELD}
          />
        </label>

        <label className="block">
          <span className={LABEL}>password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={autoComplete}
            required
            className={FIELD}
          />
        </label>

        {confirm && (
          <label className="block">
            <span className={LABEL}>repeat password</span>
            <input
              type="password"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              autoComplete="new-password"
              required
              className={FIELD}
            />
          </label>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-[15px] text-ink">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-6 w-full justify-center disabled:opacity-60">
        {action}
      </Button>

      <p className="mt-6 text-center text-[15px] text-ink-3">{footer}</p>
    </form>
  )
}
