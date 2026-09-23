import { useId, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { Eye, EyeOff } from '@untitledui/icons'

interface AuthPageProps {
  /** the small line above the title: a state, or a note about the page */
  status?: ReactNode
  title: string
  lead: ReactNode
  children: ReactNode
}

/** the frame every auth page shares, left aligned under the navbar */
export function AuthPage({ status, title, lead, children }: AuthPageProps) {
  return (
    <div className="auth-in relative z-10 flex min-h-svh justify-center px-pad pt-[16svh] pb-16">
      <div className="w-full max-w-[25rem]">
        {status && <div className="mb-4">{status}</div>}
        <h1 className="text-[44px] leading-[1.1] font-light tracking-[-0.02em] text-ink">{title}</h1>
        <p className="mt-3 mb-8 text-[15px] text-ink-2">{lead}</p>
        {children}
      </div>
    </div>
  )
}

const TONE = {
  ok: 'text-lime-600 dark:text-lime-300',
  bad: 'text-red-500',
}

/** a pulsing dot and a word, the page's state before its title */
export function Status({ tone, children }: { tone: keyof typeof TONE; children: ReactNode }) {
  return (
    <p className={`flex items-center gap-2.5 font-mono text-[13px] ${TONE[tone]}`}>
      <span className="beat" />
      {children}
    </p>
  )
}

interface FieldProps extends Omit<ComponentProps<'input'>, 'className' | 'id'> {
  label: string
  /** sits on the label's line, at the far end */
  aside?: ReactNode
  /** a quiet line under the input, an error takes its place */
  hint?: ReactNode
  error?: ReactNode
}

export function Field({ label, aside, hint, error, type, ...input }: FieldProps) {
  const id = useId()
  const [shown, setShown] = useState(false)
  const secret = type === 'password'
  const note = error ?? hint

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-mono text-[13px] text-ink">
          {label}
        </label>
        {aside}
      </div>

      <div className="relative">
        <input
          {...input}
          id={id}
          type={secret && shown ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? `${id}-note` : undefined}
          className={`w-full rounded-lg border bg-raise px-4 py-3.5 font-mono text-[15px] text-ink transition-colors placeholder:text-ink-3 ${
            secret ? 'pr-11' : ''
          } ${error ? 'border-red-500/70' : 'border-line focus:border-ink-3'}`}
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-pressed={shown}
            aria-label={shown ? 'hide password' : 'show password'}
            className="absolute inset-y-0 right-3 flex items-center text-ink-3 transition-colors hover:text-ink"
          >
            {shown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>

      {note && (
        <p
          id={`${id}-note`}
          role={error ? 'alert' : undefined}
          className={`mt-2 font-mono ${error ? 'text-[13px] text-red-500' : 'text-[12px] text-ink-3'}`}
        >
          {note}
        </p>
      )}
    </div>
  )
}

/** a failure no single field owns, above the form so the values stay put */
export function FormError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mb-6 rounded-lg border border-red-500/40 px-4 py-3 font-mono text-[13px] text-red-500">
      {children}
    </p>
  )
}

export function AuthFooter({ children }: { children: ReactNode }) {
  return <p className="mt-6 text-center text-[15px] text-ink-3">{children}</p>
}
