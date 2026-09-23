import { json, send } from './client'

// the backend calls the new one password, the old one keeps its own name
export const changePassword = (old_password: string, password: string) =>
  json<null>('PATCH', '/user/settings/change_password', { old_password, password })

export const deactivate = () => send<null>('POST', '/user/settings/deactivate')
