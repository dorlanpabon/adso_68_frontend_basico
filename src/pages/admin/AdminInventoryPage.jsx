import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Loader2, SlidersHorizontal } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { createMovement, getBalances, getMovements, getWarehouses } from '@/services/inventoryService'
import { adminListProducts } from '@/services/catalogService'

// Validación cliente (el backend revalida con su propio Zod):
// IN/OUT exigen cantidad > 0; ADJUST fija el saldo absoluto (>= 0).
const movementFormSchema = z
  .object({
    productId: z.coerce.number({ message: 'Selecciona un producto' }).int().positive('Selecciona un producto'),
    warehouseId: z.coerce.number({ message: 'Selecciona una bodega' }).int().positive('Selecciona una bodega'),
    type: z.enum(['IN', 'OUT', 'ADJUST']),
    quantity: z.coerce.number({ message: 'Cantidad inválida' }).min(0, 'No puede ser negativa'),
    reason: z.string().trim().max(255, 'Máximo 255 caracteres').optional().or(z.literal('')),
  })
  .refine((data) => data.type !== 'IN' || data.quantity > 0, {
    message: 'IN requiere cantidad mayor a 0',
    path: ['quantity'],
  })
  .refine((data) => data.type !== 'OUT' || data.quantity > 0, {
    message: 'OUT requiere cantidad mayor a 0',
    path: ['quantity'],
  })

const emptyForm = { productId: '', warehouseId: '', type: 'IN', quantity: '', reason: '' }

export default function AdminInventoryPage() {
  const queryClient = useQueryClient()
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [movementPage, setMovementPage] = useState(1)
  // Tipo de movimiento como estado propio (form.watch no es compatible con React Compiler).
  const [movementType, setMovementType] = useState('IN')

  const { data: whEnvelope } = useQuery({ queryKey: ['warehouses'], queryFn: getWarehouses })
  const warehouses = whEnvelope?.data ?? []

  const balancesFilters = { limit: 50, lowStock: lowStockOnly ? '1' : undefined }
  const { data: balEnvelope, isPending: balPending, isError: balError, error: balErr } = useQuery({
    queryKey: ['inventoryBalances', balancesFilters],
    queryFn: () => getBalances(balancesFilters),
  })
  const balances = balEnvelope?.data ?? []

  const { data: movEnvelope, isPending: movPending } = useQuery({
    queryKey: ['inventoryMovements', movementPage],
    queryFn: () => getMovements({ page: movementPage, limit: 10 }),
  })
  const movements = movEnvelope?.data ?? []
  const movMeta = movEnvelope?.meta

  // Productos físicos activos para el formulario (el backend rechaza DIGITAL igualmente).
  const { data: prodEnvelope } = useQuery({
    queryKey: ['adminProducts', 'physical'],
    queryFn: () => adminListProducts({ type: 'PHYSICAL', limit: 100 }),
  })
  const physicalProducts = (prodEnvelope?.data ?? []).filter((p) => p.active)

  const form = useForm({
    resolver: zodResolver(movementFormSchema),
    defaultValues: emptyForm,
  })

  const movementMutation = useMutation({
    mutationFn: createMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryBalances'] })
      queryClient.invalidateQueries({ queryKey: ['inventoryMovements'] })
      form.reset(emptyForm)
    },
  })

  const onSubmit = form.handleSubmit((values) =>
    movementMutation.mutate({ ...values, reason: values.reason || undefined })
  )

  const selectClass =
    'h-9 rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
  const movTypeIcon = { IN: ArrowDownToLine, OUT: ArrowUpFromLine, ADJUST: SlidersHorizontal }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
        <p className="text-sm text-muted-foreground">
          Saldos físicos por bodega y registro de movimientos (IN/OUT/ADJUST).
        </p>
      </div>

      {balError && (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar saldos: {balErr.message}</AlertDescription>
        </Alert>
      )}

      {/* Registrar movimiento */}
      <section className="rounded-xl border bg-card p-4 md:p-6">
        <h2 className="mb-4 font-semibold">Registrar movimiento</h2>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={onSubmit} noValidate>
          <div>
            <Label className="mb-1.5">Producto</Label>
            <select id="productId" className={`${selectClass} w-full`} {...form.register('productId')}>
              <option value="">Seleccionar…</option>
              {physicalProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
            {form.formState.errors.productId && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.productId.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5">Bodega</Label>
            <select id="warehouseId" className={`${selectClass} w-full`} {...form.register('warehouseId')}>
              <option value="">Seleccionar…</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} · {w.name}
                </option>
              ))}
            </select>
            {form.formState.errors.warehouseId && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.warehouseId.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5">Tipo</Label>
            <select
              id="type"
              className={`${selectClass} w-full`}
              value={movementType}
              onChange={(e) => {
                setMovementType(e.target.value)
                form.setValue('type', e.target.value)
              }}
            >
              <option value="IN">IN — Ingreso</option>
              <option value="OUT">OUT — Salida</option>
              <option value="ADJUST">ADJUST — Ajuste (saldo fijo)</option>
            </select>
          </div>

          <div>
            <Label className="mb-1.5">{movementType === 'ADJUST' ? 'Saldo nuevo' : 'Cantidad'}</Label>
            <Input id="quantity" type="number" min="0" step="1" placeholder="10" {...form.register('quantity')} />
            {form.formState.errors.quantity && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.quantity.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5">Motivo (opcional)</Label>
            <div className="flex gap-2">
              <Input id="reason" placeholder="Ej. Compra a proveedor" {...form.register('reason')} />
              <Button type="submit" disabled={movementMutation.isPending}>
                {movementMutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
                Registrar
              </Button>
            </div>
            {movementMutation.isError && (
              <p className="mt-1 text-xs text-destructive">{movementMutation.error.message}</p>
            )}
            {movementMutation.isSuccess && (
              <p className="mt-1 text-xs text-green-600">
                Registrado: saldo {movementMutation.data.data.balanceBefore} → {movementMutation.data.data.balanceAfter}
              </p>
            )}
          </div>
        </form>
      </section>

      {/* Saldos */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Saldos por bodega</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            <AlertTriangle className="size-4 text-amber-500" aria-hidden="true" />
            Solo stock bajo
          </label>
        </div>

        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Bodega</th>
                <th className="px-4 py-3 font-medium">Saldo</th>
                <th className="px-4 py-3 font-medium">Reservado</th>
                <th className="px-4 py-3 font-medium">Mínimo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {balPending && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                    Cargando saldos…
                  </td>
                </tr>
              )}
              {!balPending && balances.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                    Sin saldos registrados aún. Usa el formulario de arriba para un primer IN.
                  </td>
                </tr>
              )}
              {balances.map((b) => {
                const low = b.minStock > 0 && b.quantity <= b.minStock
                return (
                  <tr key={`${b.productId}-${b.warehouseId}`} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.productName}</div>
                      <div className="font-mono text-xs text-muted-foreground">{b.productSku}</div>
                    </td>
                    <td className="px-4 py-3">
                      {b.warehouseCode} · {b.warehouseName}
                    </td>
                    <td className="px-4 py-3 font-semibold">{b.quantity}</td>
                    <td className="px-4 py-3">{b.reservedQuantity}</td>
                    <td className="px-4 py-3">{b.minStock}</td>
                    <td className="px-4 py-3">
                      {low ? (
                        <Badge variant="destructive">
                          <AlertTriangle aria-hidden="true" />
                          Stock bajo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">OK</Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Kardex */}
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Kardex de movimientos</h2>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Bodega</th>
                <th className="px-4 py-3 font-medium">Cantidad</th>
                <th className="px-4 py-3 font-medium">Saldo final</th>
                <th className="px-4 py-3 font-medium">Motivo</th>
                <th className="px-4 py-3 font-medium">Registró</th>
              </tr>
            </thead>
            <tbody>
              {movPending && (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-muted-foreground">
                    Cargando kardex…
                  </td>
                </tr>
              )}
              {!movPending && movements.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-muted-foreground">
                    Sin movimientos aún.
                  </td>
                </tr>
              )}
              {movements.map((m) => {
                const Icon = movTypeIcon[m.type] || ArrowDownToLine
                return (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          m.type === 'IN'
                            ? 'font-medium text-green-600'
                            : m.type === 'OUT'
                              ? 'font-medium text-destructive'
                              : 'font-medium text-blue-600'
                        }
                      >
                        <Icon className="mr-1 inline size-4 align-text-bottom" aria-hidden="true" />
                        {m.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{m.productName}</div>
                      <div className="font-mono text-xs text-muted-foreground">{m.productSku}</div>
                    </td>
                    <td className="px-4 py-3">{m.warehouseCode}</td>
                    <td className="px-4 py-3">{m.quantity}</td>
                    <td className="px-4 py-3 font-semibold">{m.balanceAfter}</td>
                    <td className="px-4 py-3 max-w-40 truncate">{m.reason || '—'}</td>
                    <td className="px-4 py-3">{m.actorUsuario || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {movMeta && movMeta.totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2" aria-label="Paginación kardex">
            <Button variant="outline" size="sm" disabled={movementPage <= 1} onClick={() => setMovementPage(movementPage - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {movMeta.page} de {movMeta.totalPages} · {movMeta.total} movimientos
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={movementPage >= movMeta.totalPages}
              onClick={() => setMovementPage(movementPage + 1)}
            >
              Siguiente
            </Button>
          </nav>
        )}
      </section>
    </div>
  )
}
