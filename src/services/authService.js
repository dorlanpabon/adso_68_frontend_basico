import { api } from '@/lib/api'

// Los servicios desempaquetan: devuelven `data` directo al consumidor.
const unwrap = (envelope) => (envelope && envelope.success === true ? envelope.data : envelope)

export const login = async (usuario, clave) =>
  unwrap(await api.post('/api/v1/auth/login', { usuario, clave }, { auth: false }))

export const register = async (usuario, clave) =>
  unwrap(await api.post('/api/v1/auth/register', { usuario, clave }, { auth: false }))

export const logout = async () =>
  unwrap(await api.post('/api/v1/auth/logout', {}, { auth: false }))

export const me = async () => unwrap(await api.get('/api/v1/auth/me'))
