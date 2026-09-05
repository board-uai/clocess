import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '@/layout/Navbar'
import { Void } from '@/layout/Void'
import { Hero } from '@/pages/Hero/Hero'
import { Login } from '@/pages/Login'
import { Account, Dashboard, Profile, Server } from '@/pages/Account'
import { RequireAuth } from '@/auth'
import { Register } from '@/pages/Register'
import { AUTH_DUR } from '@/scene'
import type { StageName } from '@/scene'

/** the url is the source of truth for where the logo sits */
function stageFor(pathname: string): StageName {
  return pathname === '/' ? 'hero' : 'auth'
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [docked, setDocked] = useState(false)

  /* the return flight is pinned to the history entry it started from */
  const [returningFrom, setReturningFrom] = useState<string | null>(null)

  /* every navigation mints a new key, even back to the same path, so the hold lets go on its own */
  const leaving = returningFrom === location.key

  /* going out, the url leads and the scene follows. coming home the scene
     leads, so the form is still mounted to fade out with it */
  const stage = leaving ? 'hero' : stageFor(location.pathname)

  useEffect(() => {
    if (!leaving) return
    const id = setTimeout(() => navigate('/'), AUTH_DUR)
    return () => clearTimeout(id)
  }, [leaving, navigate])

  /* the router keeps the scroll offset across routes, every page starts at its own top */
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const leave = useCallback(() => setReturningFrom(location.key), [location.key])

  const atAccount = location.pathname.startsWith('/account')

  const chrome = (docked || leaving || stage === 'auth') && !atAccount

  return (
    <>
      {/* all three sit outside routes, a route change must not remount them */}
      <Void stage={stage} onDock={() => setDocked(true)} />
      {chrome && <Navbar atAuth={stage === 'auth' || leaving} onLeave={leave} />}
      {chrome && <Hero />}

      <Routes>
        <Route path="/" element={null} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<Account />}>
            <Route index element={<Dashboard />} />
            <Route path="servers" element={<Server />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
