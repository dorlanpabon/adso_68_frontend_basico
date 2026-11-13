import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, SearchX, Search } from 'lucide-react'
import ProductCard from '@/components/common/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { listCategories, listProducts } from '@/services/catalogService'

const SORTS = [
  { value: 'created_desc', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre A-Z' },
  { value: 'name_desc', label: 'Nombre Z-A' },
]

export default function CatalogPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState('')
  const [sort, setSort] = useState('created_desc')
  const [page, setPage] = useState(1)

  const filters = { search, category, type, sort, page, limit: 12 }

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => listProducts(filters),
    placeholderData: keepPreviousData,
  })

  const { data: categoriesEnvelope } = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  })
  const categories = categoriesEnvelope?.data ?? []

  const products = data?.data ?? []
  const meta = data?.meta

  const onFilterChange = (setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
        <p className="text-muted-foreground">Explora los productos disponibles en la tienda.</p>
      </header>

      {/* Filtros */}
      <form
        className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="search"
              className="pl-8"
              placeholder="Nombre, descripción o SKU…"
              value={search}
              onChange={onFilterChange(setSearch)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Categoría</Label>
          <select
            id="category"
            className="h-9 rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            value={category}
            onChange={onFilterChange(setCategory)}
          >
            <option value="">Todas</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Tipo</Label>
          <select
            id="type"
            className="h-9 rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            value={type}
            onChange={onFilterChange(setType)}
          >
            <option value="">Todos</option>
            <option value="PHYSICAL">Físico</option>
            <option value="DIGITAL">Digital</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sort">Ordenar por</Label>
          <select
            id="sort"
            className="h-9 rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            value={sort}
            onChange={onFilterChange(setSort)}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Estados */}
      {isError && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudo cargar el catálogo: {error.message}
        </p>
      )}

      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl border bg-muted" aria-hidden="true" />
          ))}
        </div>
      )}

      {!isPending && !isError && products.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <SearchX className="size-10 text-muted-foreground/50" aria-hidden="true" />
          <p className="font-medium">No se encontraron productos</p>
          <p className="text-sm text-muted-foreground">Prueba con otros filtros o términos de búsqueda.</p>
        </div>
      )}

      {/* Grid */}
      {!isPending && products.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Paginación">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft aria-hidden="true" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {meta.page} de {meta.totalPages} · {meta.total} productos
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
        </>
      )}
    </div>
  )
}
