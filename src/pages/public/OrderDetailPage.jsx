import { Link, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cancelOrder, getOrder } from '@/services/ordersService'
import { formatCOP } from '@/lib/utils'

const STATUS_LABEL = {
  PENDING_PAYMENT: 'Pendiente de pago',
  CONFIRMED: 'Confirmado',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_STYLE = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    retry: false,
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', id] }),
  })

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-label="Cargando pedido" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="font-medium">{error.message || 'Pedido no encontrado'}</p>
        <Button variant="outline" asChild className="mt-4">
          <Link to="/mis-pedidos">
            <ArrowLeft aria-hidden="true" />
            Mis pedidos
          </Link>
        </Button>
      </div>
    )
  }

  const { order, items } = data.data
  const cancellable = ['PENDING_PAYMENT', 'CONFIRMED'].includes(order.status) && order.paymentStatus !== 'PAID'

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link to="/mis-pedidos">
          <ArrowLeft aria-hidden="true" />
          Mis pedidos
        </Link>
      </Button>

      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedido {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            {new Date(order.createdAt).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLE[order.status] || 'bg-muted'}`}>
          {STATUS_LABEL[order.status] || order.status}
        </span>
      </header>

      {cancelMutation.isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{cancelMutation.error.message}</AlertDescription>
        </Alert>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Cant.</th>
              <th className="px-4 py-3 font-medium">Precio unit.</th>
              <th className="px-4 py-3 font-medium text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{it.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{it.sku}</div>
                </td>
                <td className="px-4 py-3">{it.quantity}</td>
                <td className="px-4 py-3">{formatCOP(it.unitPrice)}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatCOP(it.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/30">
            <tr>
              <td colSpan="3" className="px-4 py-3 text-right text-muted-foreground">
                Total
              </td>
              <td className="px-4 py-3 text-right text-lg font-bold">{formatCOP(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {cancellable && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Puedes cancelar este pedido mientras está pendiente de pago. El stock se restituye automáticamente.
          </p>
          <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
            {cancelMutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            Cancelar pedido
          </Button>
        </div>
      )}

      {order.status === 'CANCELLED' && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border bg-muted p-4 text-sm text-muted-foreground">
          <PackageCheck aria-hidden="true" />
          Este pedido fue cancelado y el inventario fue restituido.
        </div>
      )}
    </div>
  )
}
