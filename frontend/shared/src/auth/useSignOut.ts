import { useNavigate } from 'react-router-dom'
import { logout } from '../api'
import { useSession } from './session'

export function useSignOut(leaveTo?: string) {
  const navigate = useNavigate()
  const { refresh } = useSession()

  return async function signOut() {
    try {
      await logout()
    } finally {
      if (leaveTo) {
        window.location.href = leaveTo
        return
      }
      navigate('/', { replace: true })
      await refresh()
    }
  }
}
