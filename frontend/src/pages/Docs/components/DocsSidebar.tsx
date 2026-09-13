import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { DocGroup } from '../types'

interface DocsSidebarProps {
  label: string
  groups: DocGroup[]
  basePath: string
  slug: string
}

export function DocsSidebar({ label, groups, basePath, slug }: DocsSidebarProps) {
  return (
    <nav aria-label={label}>
      {groups.map((group) => (
        <Group
          key={group.title}
          group={group}
          basePath={basePath}
          slug={slug}
          // the group holding the current page starts open
          defaultOpen={group.pages.some((page) => page.slug === slug)}
        />
      ))}
    </nav>
  )
}

function Group({
  group,
  basePath,
  slug,
  defaultOpen,
}: {
  group: DocGroup
  basePath: string
  slug: string
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="py-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((was) => !was)}
        className="flex w-full items-center justify-between py-1 text-[18px] text-ink"
      >
        {group.title}
        <span
          aria-hidden="true"
          className={`text-[10px] text-ink-3 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <ul className="mt-4 space-y-1">
          {group.pages.map((page) => (
            <li key={page.slug}>
              {/* compared by slug, so the bare base path still marks the default page */}
              <Link
                to={`${basePath}/${page.slug}`}
                aria-current={page.slug === slug ? 'page' : undefined}
                className={`block border-l-2 py-2 pl-4 text-[16px] transition-colors ${
                  page.slug === slug
                    ? 'border-ink text-ink'
                    : 'border-transparent text-ink-3 hover:text-ink'
                }`}
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
