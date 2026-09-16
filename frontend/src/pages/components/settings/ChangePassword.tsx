import { useState } from 'react'
import type { ComponentProps, FormEvent } from 'react'
import { Eye, EyeOff } from '@untitledui/icons'
import { useAuth } from '@/auth'
import { changePassword } from '@/lib/api'
import { Button } from '@/ui/Button'
import { Panel } from './Panel'

const LABEL = 'mb-2 block font-mono text-[14px] text-ink-2'

/** a password input with the same show / hide toggle as sign in and register */
function PasswordInput(props: Omit<ComponentProps<'input'>, 'type' | 'className'>) {
  const [shown, setShown] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={shown ? 'text' : 'password'}
        className="w-full rounded-lg border border-line bg-ground py-4 pr-12 pl-5 font-mono text-[16px] text-ink transition-colors focus:border-ink-3"
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-pressed={shown}
        aria-label={shown ? 'hide password' : 'show password'}
        className="absolute inset-y-0 right-4 flex items-center text-ink-3 transition-colors hover:text-ink"
      >
        {shown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  )
}

export function ChangePassword() {
  const { user } = useAuth()

  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  function reset() {
    setOldPassword('')
    setPassword('')
    setError(null)
    setSuccess(false)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (pending) return

    setError(null)
    setSuccess(false)
    // the same words the server would send back, without the round trip
    if (password.length < 8) {
      setError('password should be min 8 characters')
      return
    }

    setPending(true)
    try {
      await changePassword(oldPassword, password)
      setOldPassword('')
      setPassword('')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong')
    } finally {
      setPending(false)
    }
  }

  return (
    <Panel title="change password">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {/* lets the password manager tie the new password to this account */}
        <input type="email" value={user.email} autoComplete="username" readOnly hidden />

        <label className="block">
          <span className={LABEL}>old_password</span>
          <PasswordInput
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        <div>
          <label className="block">
            <span className={LABEL}>password</span>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          {/* the hint gives its line up to the outcome, so the buttons never jump */}
          <p
            role={error ? 'alert' : undefined}
            aria-live="polite"
            className={`mt-3 font-mono text-[13px] ${error ? 'text-red-500' : success ? 'text-ink-2' : 'text-ink-3'}`}
          >
            {error ?? (success ? 'password updated' : 'min 8 characters')}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending} className="h-12 justify-center font-mono disabled:opacity-60">
            {pending ? 'updating' : 'update password'}
          </Button>
          <Button variant="ghost" onClick={reset} className="h-12 justify-center border border-line font-mono">
            cancel
          </Button>
        </div>
      </form>
    </Panel>
  )
}
