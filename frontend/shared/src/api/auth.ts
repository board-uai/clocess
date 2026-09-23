import { get, json, send } from './client'

export interface User {
  user_id: number
  email: string
}

export interface Credentials {
  email: string
  password: string
}

export interface AuthResult {
  id: number
}

export const me = () => get<User>('/user/me')

/** the server only takes an email that is already trimmed and lowercased */
const clean = ({ email, password }: Credentials) => ({ email: email.trim().toLowerCase(), password })

export const login = (credentials: Credentials) =>
  json<AuthResult>('POST', '/user/login', clean(credentials))

export const register = (credentials: Credentials) =>
  json<AuthResult>('POST', '/user/create', clean(credentials))

export const logout = () => send<null>('POST', '/user/logout')
