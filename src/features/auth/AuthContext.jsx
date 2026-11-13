import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { clearToken, getToken, setToken } from '@/lib/api'
import * as authService from '@/services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Al montar: si hay token guardado, validar con /me (rol fresco del backend).
  // La hidratación de sesión desde un sistema externo (API + token) es el caso
  // legítimo del efecto: aquí el setState sí debe ocurrir tras validar.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      // oxlint-disable-next-line set-state-in-effect
      setLoading(false)
      return
    }
    authService
      .me()
      .then((data) => setUser(data))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(() => {
    const login = async (usuario, clave) => {
      const data = await authService.login(usuario, clave)
      setToken(data.token)
      setUser(data.user)
      return data.user
    }

    const register = async (usuario, clave) => authService.register(usuario, clave)

    const logout = async () => {
      try {
        await authService.logout()
      } catch {
        // el cierre local siempre procede aunque el endpoint falle
      }
      clearToken()
      setUser(null)
    }

    return { user, loading, login, register, logout, isAuthenticated: !!user, role: user?.role ?? null }
  }, [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line only-export-components -- El hook viaja con su provider por cohesión del contexto.
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
