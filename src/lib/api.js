// Cliente HTTP central: URL base por variable de entorno, token automático,
// y desempaquetado del formato del backend { success, data, error }.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const TOKEN_KEY = 'adso_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, params, auth = true, signal } = {}) {
  const headers = {}

  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers['Authorization'] = `Bearer ${token}`

  // Query params: se omiten los vacíos/undefined para no ensuciar la URL.
  let search = ''
  if (params) {
    const usp = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') usp.set(key, value)
    }
    const qs = usp.toString()
    search = qs ? `?${qs}` : ''
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}${search}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }

  const json = await res.json().catch(() => ({}))

  if (!res.ok || json.success === false) {
    // 401: sesión expirada o inválida → limpiar token local.
    if (res.status === 401 && auth) clearToken()
    const error = new Error(json?.error?.message || 'Error en la solicitud')
    error.status = res.status
    error.code = json?.error?.code
    throw error
  }

  // Devuelve SIEMPRE el sobre { success, data, meta } (los endpoints legacy
  // sin sobre regresan tal cual). Cada consumidor decide cómo usarlo.
  return json
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}

/** Concatena params para las funciones de servicio. */
export function buildQuery(params) {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') usp.set(key, value)
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}
