import { useNavigate } from 'react-router-dom'
import { logout } from '../api'
import { forgetEmail, useSession } from './session'

export function useSignOut() {
  const navigate = useNavigate()
  const { refresh } = useSession()

  return async function signOut() {
    forgetEmail()
    try {
      await logout()
    } finally {
      // only app's env defines this — website's own bundle never does, so this
      // alone tells us whether we're signing out from app (cross-app hard nav)
      // or from website itself (stay in-SPA)
      const websiteUrl = import.meta.env.VITE_WEBSITE_URL as string | undefined
      if (websiteUrl) {
        window.location.href = `${websiteUrl}?leaving=1`
        return
      }
      navigate('/', { replace: true })
      await refresh()
    }
  }
}
