import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, ShoppingCart } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCart } from '@/features/cart/CartContext'
import { useAuth } from '@/features/auth/AuthContext'
import { formatCOP } from '@/lib/utils'
import { checkout } from '@/services/ordersService'

const checkoutFormSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  email: z.string().trim().email('Correo inválido').max(150),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
})

export default function CheckoutPage() {
  const { items, clear } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Una clave por intento de compra: si la red falla y el usuario reintenta,
  // el backend devuelve el pedido original en vez de duplicar la compra.
  // useState con inicializador perezoso: se genera UNA sola vez, no en cada render.
  // (crypto.randomUUID requiere contexto seguro; localhost lo es.)
  const [idempotencyKey] = useState(() => crypto.randomUUID().replace(/-/g, ''))

  const form = useForm({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { name: '', email: '', phone: '' },
  })

  const mutation = useMutation({
    mutationFn: checkout,
    onSuccess: (envelope) => {
      clear()
      navigate(`/pedido/${envelope.data.order.id}`)
    },
  })

  // El backend rechaza carritos vacíos; aquí se guía antes.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/checkout' }} replace />
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingCart className="size-12 text-muted-foreground/40" aria-hidden="true" />
        <h1 className="text-2xl font-bold">No hay nada para pagar</h1>
        <Button asChild>
          <Link to="/productos">Ir al catálogo</Link>
        </Button>
      </div>
    )
  }

  const estimated = items.reduce((acc, it) => acc + Number(it.price || 0) * it.quantity, 0)

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate({
      items: items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
      customer: { ...values, phone: values.phone || undefined },
      idempotencyKey,
    })
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Finalizar compra</h1>
        <p className="text-muted-foreground">Confirma tus datos de contacto para crear el pedido.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border bg-card p-4 md:p-6">
          <h2 className="mb-4 font-semibold">Datos de contacto</h2>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit} noValidate>
            {mutation.isError && (
              <Alert variant="destructive" className="sm:col-span-2">
                <AlertDescription>{mutation.error.message}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label className="mb-1.5">Nombre completo</Label>
              <Input id="name" placeholder="Ana Gómez" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-1.5">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="ana@ejemplo.com" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-1.5">Teléfono (opcional)</Label>
              <Input id="phone" placeholder="3001234567" {...form.register('phone')} />
              {form.formState.errors.phone && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
                Confirmar pedido
              </Button>
            </div>
          </form>
        </section>

        <aside className="h-fit rounded-xl border bg-card p-4">
          <h2 className="mb-3 font-semibold">Tu pedido</h2>
          <ul className="flex flex-col divide-y text-sm">
            {items.map((it) => (
              <li key={it.productId} className="flex justify-between gap-2 py-2">
                <span className="truncate">
                  {it.quantity} × {it.name}
                </span>
                <span className="shrink-0 font-medium">{formatCOP(Number(it.price) * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t pt-3 font-bold">
            <span>Estimado</span>
            <span>{formatCOP(estimated)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            El total y la disponibilidad se confirman en el servidor al crear el pedido.
          </p>
        </aside>
      </div>
    </div>
  )
}
