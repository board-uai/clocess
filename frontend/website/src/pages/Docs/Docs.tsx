import { Outlet } from 'react-router-dom'
import { DocsNav } from './DocsNav'

/** solid ground over the void, so the scene stays out of the reading */
export function Docs() {
  return (
    <div className="relative z-10 min-h-svh bg-ground text-ink">
      <DocsNav />

      <main className="mx-auto max-w-[1440px] px-pad pt-[10svh] pb-32">
        <Outlet />
      </main>
    </div>
  )
}
