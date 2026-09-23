import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

/** the rail is fixed, so the column has to hold its own width open */
export function Account() {
  return (
    <div className="relative z-10 min-h-svh bg-ground text-ink">
      <Sidebar />

      <main className="pt-16 sm:pt-0 sm:pl-72">
        <div className="px-pad pt-14 pb-24 sm:pt-[18svh]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
