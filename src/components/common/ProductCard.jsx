import { Link } from 'react-router'
import { Package } from 'lucide-react'
import { formatCOP } from '@/lib/utils'

// Tarjeta de producto del catálogo: imagen con fallback, precio COP y enlace al detalle.
export default function ProductCard({ product }) {
  return (
    <Link
      to={`/productos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <Package className="size-12 text-muted-foreground/40" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.categoryName || (product.type === 'DIGITAL' ? 'Digital' : 'Producto')}
        </span>
        <h3 className="font-medium leading-snug group-hover:underline">{product.name}</h3>
        <p className="mt-auto pt-2 font-semibold">{formatCOP(product.price)}</p>
      </div>
    </Link>
  )
}
