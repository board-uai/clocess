import { useNavigate } from 'react-router-dom'
import { logout } from '@/lib/api'
import { useSession } from './session'

export function useSignOut() {
  const navigate = useNavigate()
  const { refresh } = useSession()

  return async function signOut() {
    try {
      await logout()
    } finally {
      navigate('/', { replace: true })
      await refresh()
    }
  }
}
