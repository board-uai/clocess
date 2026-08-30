const BASE = '/api'

/** echo reports a failure as { "message": ... } */
function messageOf(payload: unknown): string | null {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const { message } = payload as { message: unknown }
    if (typeof message === 'string') return message
  }
  return null
}

/** some endpoints answer with no body, and a dead proxy answers with html */
function parse(text: string): unknown {
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}

/** every call carries the cookie, the session never travels in a body */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, { ...init, credentials: 'include' })

  const payload = parse(await res.text())
  if (!res.ok) throw new Error(messageOf(payload) ?? `request failed (${res.status})`)

  return payload as T
}

export const get = <T>(path: string) => request<T>(path)

export const send = <T>(method: string, path: string, body?: BodyInit) =>
  request<T>(path, { method, body })

export const json = <T>(method: string, path: string, body: unknown) =>
  request<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

/** a stream is fetched by the browser, not by this module, so it only needs the url */
export const url = (path: string) => BASE + path
