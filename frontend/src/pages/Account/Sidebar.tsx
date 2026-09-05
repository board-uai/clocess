import { Link, NavLink } from 'react-router-dom'

const SECTIONS = [
  { label: 'Dashboard', to: '/account', end: true },
  { label: 'Servers', to: '/account/servers', end: false },
  { label: 'Settings', to: '/account/profile', end: false },
]

const TILE =
  'block rounded-2xl border px-5 py-3 text-center text-[17px] transition-colors sm:py-3 sm:text-left'

const REST = 'border-line bg-raise text-ink-3 hover:text-ink'
const ON = 'border-transparent bg-fill text-on-fill'

export function Sidebar() {
  return (
    <nav
      aria-label="Account"
      className="fixed inset-x-0 top-0 z-20 flex h-16 items-center gap-4 bg-ground px-pad sm:inset-y-0 sm:right-auto sm:h-auto sm:w-72 sm:flex-col sm:items-stretch sm:gap-0 sm:px-6 sm:py-10"
    >
      <Link to="/" className="font-mark text-[50px] leading-none text-ink sm:mb-8 sm:text-center">
        clocess
      </Link>

      <ul className="flex gap-2 sm:flex-col sm:gap-3">
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

      <div className="ml-auto flex items-center gap-3 sm:mt-auto sm:ml-0 sm:flex-col sm:items-stretch sm:gap-3">
        <Link
          to="/"
          className="rounded-xl border border-line px-4 py-2 text-center text-[15px] text-ink-2 transition-colors hover:bg-fill hover:text-on-fill"
        >
          log out
        </Link>
      </div>
    </nav>
  )
}
