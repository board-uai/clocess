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

export const login = (credentials: Credentials) => json<AuthResult>('POST', '/user/login', credentials)

export const register = (credentials: Credentials) =>
  json<AuthResult>('POST', '/user/create', credentials)

export const logout = () => send<null>('POST', '/user/logout')
