import { createContext, useContext } from 'react'
import type { User } from '../api'

/** checking is the gap before the first /user/me comes back */
export type SessionStatus = 'checking' | 'in' | 'out'

export interface Session {
  user: User | null
  status: SessionStatus
  /** re-asks the server, the cookie can change without react ever seeing it */
  refresh: () => Promise<void>
}

export const SessionCtx = createContext<Session | null>(null)

export function useSession() {
  const session = useContext(SessionCtx)
  if (!session) throw new Error('useSession is only valid under AuthProvider')
  return session
}
