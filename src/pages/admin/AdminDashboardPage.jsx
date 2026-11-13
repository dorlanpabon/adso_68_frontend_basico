import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, DollarSign, Package, ShoppingCart } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getDashboard } from '@/services/reportsService'
import { formatCOP } from '@/lib/utils'

const STATUS_LABEL = {
  PENDING_PAYMENT: 'Pendiente de pago',
  CONFIRMED: 'Confirmado',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export default function AdminDashboardPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard({}),
  })

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error al cargar el dashboard: {error.message}</AlertDescription>
      </Alert>
    )
  }

  const { summary, salesByDay, topProducts, recentOrders, lowStock } = data.data

  const statCards = [
    {
      title: 'Ventas totales',
      value: formatCOP(summary.revenueTotal),
      description: 'Pedidos no cancelados',
      icon: DollarSign,
    },
    {
      title: 'Pedidos activos',
      value: summary.ordersActive,
      description: `${summary.ordersCancelled} cancelado(s)`,
      icon: ShoppingCart,
    },
    {
      title: 'Pendientes de pago',
      value: summary.ordersPendingPayment,
      description: 'En estado PENDING_PAYMENT',
      icon: Package,
    },
    {
      title: 'Ventas últimos 30 días',
      value: formatCOP(summary.revenue30d),
      description: `${summary.ordersTotal} pedido(s) en total`,
      icon: DollarSign,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumen de ventas, pedidos y alertas de inventario.</p>
        </div>
        {lowStock.length > 0 && (
          <Badge variant="destructive">
            <AlertTriangle aria-hidden="true" />
            {lowStock.length} producto(s) con stock bajo
          </Badge>
        )}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ventas por día (últimos 30 días con ventas) */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por día</CardTitle>
            <CardDescription>Últimos 30 días (solo días con pedidos activos)</CardDescription>
          </CardHeader>
          <CardContent>
            {salesByDay.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Sin ventas registradas aún.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Día</TableHead>
                    <TableHead className="text-right">Pedidos</TableHead>
                    <TableHead className="text-right">Facturado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesByDay.map((row) => (
                    <TableRow key={row.day}>
                      <TableCell>
                        {new Date(row.day).toLocaleDateString('es-CO', { dateStyle: 'medium' })}
                      </TableCell>
                      <TableCell className="text-right">{row.orders}</TableCell>
                      <TableCell className="text-right font-medium">{formatCOP(row.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos más vendidos</CardTitle>
            <CardDescription>Por facturación (pedidos activos)</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Sin ventas aún.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Unidades</TableHead>
                    <TableHead className="text-right">Facturado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((p) => (
                    <TableRow key={p.productId}>
                      <TableCell>
                        <div className="font-medium">{p.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{p.sku}</div>
                      </TableCell>
                      <TableCell className="text-right">{p.unitsSold}</TableCell>
                      <TableCell className="text-right font-medium">{formatCOP(p.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pedidos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos recientes</CardTitle>
          <CardDescription>Últimos {recentOrders.length} pedido(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No hay pedidos aún.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{o.customerName}</div>
                      <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={o.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                        {STATUS_LABEL[o.status] || o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCOP(o.total)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/pedido/${o.id}`}>Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stock bajo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Alertas de stock bajo</CardTitle>
            <CardDescription>Productos cuyo saldo no supera su mínimo configurado</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/inventario">Gestionar inventario</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sin alertas: ningún producto está por debajo de su mínimo.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Bodega</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Mínimo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.map((b) => (
                  <TableRow key={`${b.productId}-${b.warehouseId}`}>
                    <TableCell>
                      <div className="font-medium">{b.productName}</div>
                      <div className="font-mono text-xs text-muted-foreground">{b.productSku}</div>
                    </TableCell>
                    <TableCell>{b.warehouseCode}</TableCell>
                    <TableCell className="text-right font-semibold">{b.quantity}</TableCell>
                    <TableCell className="text-right">{b.minStock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
