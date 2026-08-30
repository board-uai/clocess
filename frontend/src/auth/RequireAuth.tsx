import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from './session'

/** the session cookie is httponly, so only the server can say whether it is still good */
export function RequireAuth() {
  const location = useLocation()
  const { user, status } = useSession()

  // nothing paints while the answer is in flight, a flash of the page would leak it
  if (status === 'checking') return null

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
