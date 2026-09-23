import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'

export type ButtonVariant = 'solid' | 'quiet' | 'ghost' | 'dashed'

const BASE = 'inline-flex items-center gap-2 text-[17px] whitespace-nowrap'

/** each variant owns its transition, two transition utilities on one node clash */
const VARIANT: Record<ButtonVariant, string> = {
  solid:
    'rounded-md bg-fill px-7 py-2 text-on-fill transition-transform motion-safe:hover:-translate-y-px',
  quiet: 'text-ink-3 transition-colors hover:text-ink',
  ghost: 'rounded-md px-7 py-2 text-ink transition-colors hover:bg-fill hover:text-on-fill',
  /* the unfinished half of a pair: the same geometry as solid, drawn rather
     than filled, so the two read as one control with one of them offered */
  dashed:
    'rounded-md border border-dashed border-ink/70 px-7 py-2 text-ink transition-colors hover:bg-ink/5',
}

/** to routes in place, href leaves the app, neither one is a button */
type ButtonProps = { variant?: ButtonVariant; className?: string } & (
  | ({ to: string } & Omit<ComponentProps<typeof Link>, 'to' | 'className'>)
  | ({ href: string } & Omit<ComponentProps<'a'>, 'className'>)
  | Omit<ComponentProps<'button'>, 'className'>
)

export function Button({ variant = 'solid', className, ...rest }: ButtonProps) {
  const classes = className
    ? `${BASE} ${VARIANT[variant]} ${className}`
    : `${BASE} ${VARIANT[variant]}`

  if ('to' in rest) {
    return <Link {...(rest as ComponentProps<typeof Link>)} className={classes} />
  }

  if ('href' in rest) {
    return <a {...(rest as ComponentProps<'a'>)} className={classes} />
  }

  // before the spread, so a caller can still ask for submit
  return <button type="button" {...(rest as ComponentProps<'button'>)} className={classes} />
}
