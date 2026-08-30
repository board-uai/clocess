import { Link, NavLink } from 'react-router-dom'

const SECTIONS = [
  { label: 'dashboard', to: '/account/dashboard', end: false },
  { label: 'server', to: '/account/server', end: false },
]

const TILE =
  'block rounded-2xl border px-5 py-3 text-center text-[17px] transition-colors sm:py-4 sm:text-left'

const REST = 'border-line bg-raise text-ink-3 hover:text-ink'
const ON = 'border-transparent bg-fill text-on-fill'

export function Sidebar() {
  return (
    <nav
      aria-label="Account"
      className="fixed inset-x-0 top-0 z-20 flex h-16 items-center gap-2 border-b border-hair bg-ground px-pad sm:inset-y-0 sm:right-auto sm:h-auto sm:w-72 sm:flex-col sm:items-stretch sm:gap-0 sm:border-r sm:border-b-0 sm:px-6 sm:py-10"
    >
      <ul className="flex gap-2 sm:mt-14 sm:flex-col sm:gap-3">
        {SECTIONS.map(({ label, to, end }) => (
          <li key={label}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => `${TILE} ${isActive ? ON : REST}`}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="ml-auto flex gap-2 sm:mt-auto sm:ml-0 sm:flex-col sm:gap-3">
        {/* the navbar is hidden on this page, this is the only way home */}
        <Link to="/" className={`${TILE} ${ON}`}>
          log out
        </Link>

        <NavLink to="/account" end className={({ isActive }) => `${TILE} ${isActive ? ON : REST}`}>
          profile
        </NavLink>
      </div>
    </nav>
  )
}
