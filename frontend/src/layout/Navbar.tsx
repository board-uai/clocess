import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/ui/Button'
import { useSession, useSignOut } from '@/auth'

const DESTINATIONS = [
  { label: 'docs', href: '#' },
  { label: 'github', href: '#' },
]

const PILL =
  'rounded-md bg-fill px-4 py-2 text-center text-[15px] whitespace-nowrap text-on-fill transition-opacity hover:opacity-80'

interface NavbarProps {
  /** which set of actions the corner holds, the fade itself rides the flight */
  atAuth: boolean
  /** flies home first and routes after, so the form can fade out on the way */
  onLeave: () => void
}

export function Navbar({ atAuth, onLeave }: NavbarProps) {
  const { user } = useSession()
  const signOut = useSignOut()
  const [open, setOpen] = useState(false)
  const corner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onDown = (e: PointerEvent) => {
      if (!corner.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <nav aria-label="Main" className="relative z-20">
      <div className="mx-auto flex h-22 max-w-page items-center justify-between gap-8 px-pad">
        <ul className="flex items-center gap-8 sm:gap-12">
          {DESTINATIONS.map(({ label, href }) => (
            <li key={label}>
              <Button variant="quiet" href={href}>
                {label}
              </Button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-6">
          {!user && (
            <>
              <Button variant="quiet" to="/login">
                sign in
              </Button>

              <Button to="/register">register</Button>
            </>
          )}

          {/* always in the flow so nothing shifts, it only fades with the flight */}
          <Button
            variant="quiet"
            onClick={onLeave}
            aria-hidden={!atAuth}
            // pointer-events alone still leaves it in the tab order while hidden
            tabIndex={atAuth ? undefined : -1}
            className={atAuth ? 'exit-in' : 'pointer-events-none opacity-0'}
          >
            return back
          </Button>

          {user && (
            <div ref={corner} className="relative shrink-0">
              <button
                type="button"
                aria-label="your account"
                aria-expanded={open}
                onClick={() => setOpen((was) => !was)}
                className="block transition-opacity hover:opacity-70"
              >
                <img src="/svg/user.png" alt="" className="h-8 w-8" />
              </button>

              {open && (
                <div className="absolute left-1/2 top-full z-30 mt-3 flex -translate-x-1/2 gap-3">
                  <Link to="/account" onClick={() => setOpen(false)} className={PILL}>
                    account
                  </Link>

                  <button type="button" onClick={() => void signOut()} className={PILL}>
                    sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
