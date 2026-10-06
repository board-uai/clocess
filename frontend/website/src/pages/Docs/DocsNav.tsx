import { Link, NavLink } from 'react-router-dom'
import { Button } from '@clocess/shared/ui'
import { useSession } from '@clocess/shared/auth'

const SECTIONS = [
  { label: 'docs', to: '/docs', end: true },
  { label: 'documentation', to: '/docs/documentation', end: false },
  { label: 'api', to: '/docs/api', end: false },
]

const LINK = 'text-[17px] whitespace-nowrap transition-colors'

export function DocsNav() {
  const { user } = useSession()

  return (
    <nav aria-label="Docs">
      <div className="mx-auto flex max-w-360 flex-wrap items-center justify-between gap-x-8 gap-y-3 px-pad py-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link to="/" className="font-mark text-[50px] leading-none text-ink">
            clocess
          </Link>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {SECTIONS.map(({ label, to, end }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `${LINK} ${isActive ? 'text-ink' : 'text-ink-3 hover:text-ink'}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
            <li>
              <Button variant="quiet" href="https://github.com/board-uai/clocess" target="_blank">
                github
              </Button>
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <Button to="/account">account</Button>
          ) : (
            <>
              <Button variant="quiet" to="/login">
                sign in
              </Button>
              <Button to="/register">register</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
