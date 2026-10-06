import { useSession } from './session'

/** a guarded page has a user for certain, this saves it the null check */
export function useAuth() {
  const { user } = useSession()
  if (!user) throw new Error('useAuth is only valid under RequireAuth')
  return { user }
}
