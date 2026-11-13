import { Link, useNavigate } from 'react-router'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/features/cart/CartContext'
import { useAuth } from '@/features/auth/AuthContext'
import { formatCOP } from '@/lib/utils'

export default function CartPage() {
  const { items, setQuantity, removeItem, clear, count } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const subtotal = items.reduce((acc, it) => acc + Number(it.price || 0) * it.quantity, 0)

  const onCheckout = () => {
    // El total real lo calcula el servidor; esto es solo la selección.
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    navigate('/checkout')
  }

  if (count === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingCart className="size-12 text-muted-foreground/40" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-muted-foreground">Explora el catálogo y añade productos para comprarlos.</p>
        <Button asChild>
          <Link to="/productos">Ir al catálogo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carrito</h1>
          <p className="text-muted-foreground">{count} artículo(s)</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clear}>
          <Trash2 aria-hidden="true" />
          Vaciar carrito
        </Button>
      </header>

      <ul className="flex flex-col divide-y rounded-xl border bg-card">
        {items.map((it) => (
          <li key={it.productId} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <Link to={`/productos/${it.slug}`} className="font-medium hover:underline">
                {it.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {formatCOP(it.price)} · {it.type === 'DIGITAL' ? 'Digital' : 'Físico'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label={`Quitar una unidad de ${it.name}`}
                onClick={() => setQuantity(it.productId, it.quantity - 1)}
              >
                <Minus aria-hidden="true" />
              </Button>
              <span className="w-10 text-center font-medium" aria-live="polite">
                {it.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label={`Añadir una unidad de ${it.name}`}
                onClick={() => setQuantity(it.productId, it.quantity + 1)}
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>

            <div className="w-28 text-right font-semibold">{formatCOP(Number(it.price) * it.quantity)}</div>

            <Button
              variant="ghost"
              size="icon"
              aria-label={`Eliminar ${it.name} del carrito`}
              onClick={() => removeItem(it.productId)}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col items-end gap-3 rounded-xl border bg-card p-4">
        <div className="flex w-full justify-between text-lg">
          <span className="text-muted-foreground">Subtotal (estimado)</span>
          <span className="font-bold">{formatCOP(subtotal)}</span>
        </div>
        <p className="w-full text-right text-xs text-muted-foreground">
          El total real se calcula en el servidor con los precios vigentes al confirmar.
        </p>
        <Button size="lg" onClick={onCheckout}>
          Continuar al pago
        </Button>
      </div>
    </div>
  )
}
