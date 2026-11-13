import { Link, Outlet, useNavigate } from 'react-router'
import { LogOut, ShoppingBag, ShoppingCart, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { useCart } from '@/features/cart/CartContext'
import { cn } from '@/lib/utils'

// El año solo alimenta el pie de página; se calcula fuera del render.
const CURRENT_YEAR = new Date().getFullYear()

function Header() {
  const { user, logout, isAuthenticated, role } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const onLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ShoppingBag className="size-5 text-primary" aria-hidden="true" />
          <span>ADSO 68</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/productos">Catálogo</Link>
          </Button>

          {role === 'ADMIN' && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/productos">Admin</Link>
            </Button>
          )}

          {/* Carrito: enlace real a /carrito */}
          <Button variant="ghost" size="icon" asChild aria-label={`Carrito: ${count} artículo(s)`}>
            <Link to="/carrito">
              <span className="relative">
                <ShoppingCart aria-hidden="true" />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {count}
                  </span>
                )}
              </span>
            </Link>
          </Button>

          {isAuthenticated && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/mis-pedidos">Mis pedidos</Link>
            </Button>
          )}

          {isAuthenticated ? (
            <>
              <span
                className={cn(
                  'hidden items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium sm:flex',
                  role === 'ADMIN' ? 'border-primary/30 text-primary' : 'text-muted-foreground'
                )}
              >
                <UserRound className="size-3.5" aria-hidden="true" />
                {user.usuario}
                {role ? ` · ${role}` : ''}
              </span>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut aria-hidden="true" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/registro">Crear cuenta</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
        ADSO 68 · Tienda virtual y gestión de bodega · {CURRENT_YEAR}
      </div>
    </footer>
  )
}

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
