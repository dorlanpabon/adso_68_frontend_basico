import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Package, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/features/cart/CartContext'
import { formatCOP } from '@/lib/utils'
import { getProduct } from '@/services/catalogService'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const [cantidad, setCantidad] = useState(1)
  const [added, setAdded] = useState(false)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug),
    retry: false,
  })

  const product = data?.data

  const onAdd = () => {
    if (!product) return
    addItem(product, cantidad)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-label="Cargando producto" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="font-medium">{error?.message || 'Producto no encontrado'}</p>
        <Button variant="outline" asChild className="mt-4">
          <Link to="/productos">
            <ArrowLeft aria-hidden="true" />
            Volver al catálogo
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link to="/productos">
          <ArrowLeft aria-hidden="true" />
          Catálogo
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Imagen con fallback */}
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="size-24 text-muted-foreground/30" aria-hidden="true" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {product.categoryName && <Badge variant="secondary">{product.categoryName}</Badge>}
            <Badge variant={product.type === 'DIGITAL' ? 'default' : 'outline'}>
              {product.type === 'DIGITAL' ? 'Digital' : 'Físico'}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-3xl font-semibold text-primary">{formatCOP(product.price)}</p>

          {product.description && <p className="text-muted-foreground">{product.description}</p>}

          <dl className="grid gap-1 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <dt className="font-medium text-foreground">SKU:</dt>
              <dd>{product.sku}</dd>
            </div>
            {product.type === 'PHYSICAL' && (
              <div className="flex gap-2">
                <dt className="font-medium text-foreground">Disponibilidad:</dt>
                <dd>Se confirma según existencias de bodega al crear el pedido.</dd>
              </div>
            )}
          </dl>

          {/* Añadir al carrito */}
          <div className="mt-2 flex items-center gap-3">
            <label htmlFor="cantidad" className="text-sm font-medium">
              Cantidad
            </label>
            <input
              id="cantidad"
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
              className="h-9 w-20 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <Button onClick={onAdd} disabled={added}>
              <ShoppingCart aria-hidden="true" />
              {added ? 'Añadido ✓' : 'Añadir al carrito'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
