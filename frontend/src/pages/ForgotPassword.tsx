import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthFooter, AuthPage, Field, Status } from '@/auth'
import { Button } from '@/ui/Button'

const RESEND_WAIT = 60

// TODO: no reset endpoint yet, both sends only move the page along until it exists
export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)

  if (sentTo) return <CheckEmail email={sentTo} onRestart={() => setSentTo(null)} />

  return (
    <AuthPage
      title="forgot your password"
      lead="we send a one-time link that lets you set a new one. the link dies in 30 minutes."
    >
      {/* no server to ask yet, so the browser's own email check stands in */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSentTo(email.trim().toLowerCase())
        }}
      >
        <Field
          label="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <Button type="submit" variant="dashed" className="mt-6 h-12 w-full justify-center font-mono">
          send the link
        </Button>
      </form>

      <AuthFooter>
        remembered it?{' '}
        <Link to="/login" className="text-ink transition-colors hover:text-ink-2">
          sign in
        </Link>
      </AuthFooter>
    </AuthPage>
  )
}

function CheckEmail({ email, onRestart }: { email: string; onRestart: () => void }) {
  const [left, setLeft] = useState(RESEND_WAIT)

  useEffect(() => {
    if (left === 0) return
    const id = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(id)
  }, [left])

  return (
    <AuthPage
      status={<Status tone="ok">sent</Status>}
      title="check your email"
      lead={
        <>
          a link is on its way to <strong className="font-mono font-medium text-ink">{email}</strong>. it
          works once and expires in 30 minutes. you can close this tab.
        </>
      }
    >
      <Button
        variant="ghost"
        disabled={left > 0}
        onClick={() => setLeft(RESEND_WAIT)}
        className="h-12 w-full justify-center border border-line font-mono disabled:pointer-events-none disabled:text-ink-3"
      >
        {left > 0 ? `resend in ${left} s` : 'resend the link'}
      </Button>

      <AuthFooter>
        wrong address?{' '}
        <button type="button" onClick={onRestart} className="text-ink transition-colors hover:text-ink-2">
          start again
        </button>
      </AuthFooter>
    </AuthPage>
  )
}
