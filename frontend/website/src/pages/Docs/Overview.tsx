import { Link } from 'react-router-dom'
import { DocsHeader } from './DocsHeader'

const CARDS = [
  { title: 'documentation', link: 'introduction', to: '/docs/documentation' },
  { title: 'api', link: 'endpoints & errors', to: '/docs/api' },
]

export function Overview() {
  return (
    <>
      <DocsHeader title="docs">
        everything the daemon does, and every response it can give you
        not much of it.
      </DocsHeader>

      <ul className="mt-16 grid max-w-page gap-5 sm:grid-cols-2">
        {CARDS.map(({ title, link, to }) => (
          <li key={title}>
            <Link
              to={to}
              className="group block rounded-xl border border-line bg-raise p-6 transition-colors hover:border-ink-3"
            >
              <span className="font-mono text-[13px] text-ink-3">{title}</span>
              <span className="mt-3 block text-[17px] text-ink">
                {link}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
