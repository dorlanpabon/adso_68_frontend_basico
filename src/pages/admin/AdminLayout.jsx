import { Link, Outlet, useNavigate } from 'react-router'
import { Boxes, FolderTree, LayoutDashboard, LogOut, Package, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'

// Layout administrativo: sidebar colapsable simple + contenido.
// Dashboard/Pedidos aparecen deshabilitados hasta las Fases 7-8.
export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = async () => {
    await logout()
    navigate('/')
  }

  const navItem = 'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground'

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card p-4 md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2 font-semibold">
          <Store className="size-5 text-primary" aria-hidden="true" />
          ADSO 68 · Admin
        </Link>
        <nav className="flex flex-col gap-1">
          <span className={navItem} aria-disabled="true">
            <LayoutDashboard aria-hidden="true" />
            Dashboard <span className="text-xs">(Fase 8)</span>
          </span>
          <Link to="/admin/productos" className={navItem}>
            <Boxes aria-hidden="true" />
            Productos
          </Link>
          <Link to="/admin/categorias" className={navItem}>
            <FolderTree aria-hidden="true" />
            Categorías
          </Link>
          <Link to="/admin/inventario" className={navItem}>
            <Package aria-hidden="true" />
            Inventario
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t pt-4 text-sm">
          <span className="px-2 text-muted-foreground">
            {user?.usuario} · {user?.role}
          </span>
          <Button variant="ghost" size="sm" onClick={onLogout} className="justify-start px-2">
            <LogOut aria-hidden="true" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
          <Link to="/" className="text-sm text-muted-foreground hover:underline md:hidden">
            ← Tienda
          </Link>
          <span className="text-sm font-medium">Panel de administración</span>
          <Link to="/" className="hidden text-sm text-muted-foreground hover:underline md:block">
            Ver tienda
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
