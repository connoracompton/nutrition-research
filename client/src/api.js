// All calls to our Express backend go through this one helper, so the
// login token and error handling live in exactly one place.
const TOKEN_KEY = 'nutrition-token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY))

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`

  let response
  try {
    response = await fetch(`/api${path}`, { method, headers, body: body && JSON.stringify(body) })
  } catch {
    throw new Error('Cannot reach the server. Is it running?')
  }
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error ?? `Request failed (${response.status})`)
    error.status = response.status
    throw error
  }
  return data
}
