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
      const websiteUrl = import.meta.env.VITE_WEBSITE_URL as string | undefined
      if (websiteUrl && window.location.origin !== new URL(websiteUrl).origin) {
        window.location.href = `${websiteUrl}?leaving=1`
        return
      }
      navigate('/', { replace: true })
      await refresh()
    }
  }
}
