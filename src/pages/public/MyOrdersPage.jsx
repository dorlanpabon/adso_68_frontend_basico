import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { formatCOP } from '@/lib/utils'
import { getMyOrders } from '@/services/ordersService'

const STATUS_LABEL = {
  PENDING_PAYMENT: 'Pendiente de pago',
  CONFIRMED: 'Confirmado',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export default function MyOrdersPage() {
  const { isAuthenticated, loading } = useAuth()
  const [page, setPage] = useState(1)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['myOrders', page],
    queryFn: () => getMyOrders({ page, limit: 10 }),
    placeholderData: keepPreviousData,
    enabled: isAuthenticated,
  })

  if (loading) {
    return <div className="px-4 py-24 text-center text-sm text-muted-foreground">Verificando sesión…</div>
  }
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/mis-pedidos' }} replace />

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mis pedidos</h1>
        <p className="text-muted-foreground">Historial de compras de tu cuenta.</p>
      </header>

      {isError && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudo cargar el historial: {error.message}
        </p>
      )}

      {isPending && <div className="h-40 animate-pulse rounded-xl border bg-muted" aria-hidden="true" />}

      {!isPending && orders.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <PackageOpen className="size-12 text-muted-foreground/40" aria-hidden="true" />
          <p className="font-medium">Aún no tienes pedidos</p>
          <Button asChild>
            <Link to="/productos">Explorar catálogo</Link>
          </Button>
        </div>
      )}

      {!isPending && orders.length > 0 && (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                to={`/pedido/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="font-mono text-sm font-semibold">{o.orderNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString('es-CO', { dateStyle: 'long' })} · {o.itemCount}{' '}
                    artículo(s)
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{STATUS_LABEL[o.status] || o.status}</span>
                  <span className="font-bold">{formatCOP(o.total)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {meta && meta.totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Paginación pedidos">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft aria-hidden="true" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {meta.page} de {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      )}
    </div>
  )
}
