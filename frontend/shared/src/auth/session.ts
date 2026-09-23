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

const EMAIL_KEY = 'clocess:email'

/** the last signed-in email of this tab, so a dead session only has to ask for the password */
export const rememberedEmail = () => sessionStorage.getItem(EMAIL_KEY)

export const rememberEmail = (email: string) => sessionStorage.setItem(EMAIL_KEY, email)

/** a deliberate exit, the next guarded page goes to sign in, not to signed out */
export const forgetEmail = () => sessionStorage.removeItem(EMAIL_KEY)

export const SessionCtx = createContext<Session | null>(null)

export function useSession() {
  const session = useContext(SessionCtx)
  if (!session) throw new Error('useSession is only valid under AuthProvider')
  return session
}
