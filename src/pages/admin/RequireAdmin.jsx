import { Navigate } from 'react-router'
import { useAuth } from '@/features/auth/AuthContext'

/** Guard de ruta admin: exige sesión iniciada y rol ADMIN.
 *  La autorización REAL vive en el backend; esto solo guía la UI. */
export default function RequireAdmin({ children }) {
  const { isAuthenticated, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Verificando sesión…
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-6xl font-bold text-primary">403</p>
        <h1 className="mt-2 text-2xl font-semibold">Acceso restringido</h1>
        <p className="mt-2 text-muted-foreground">Tu cuenta no tiene permisos de administrador.</p>
      </div>
    )
  }
  return children
}
