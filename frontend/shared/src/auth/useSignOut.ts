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
      navigate('/', { replace: true })
      await refresh()
    }
  }
}
