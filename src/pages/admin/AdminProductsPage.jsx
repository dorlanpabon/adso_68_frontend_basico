import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Pencil, Plus, PowerOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  adminCreateProduct,
  adminListCategories,
  adminListProducts,
  adminUpdateProduct,
} from '@/services/catalogService'
import { formatCOP } from '@/lib/utils'
import { z } from 'zod'

// Esquema de formulario (cliente). El backend revalida todo con su propio Zod.
// Los campos opcionales vacíos ('') se normalizan a undefined antes de validar.
const optionalId = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z.coerce.number().int().positive().optional()
)
const optionalUrl = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z.string().url('URL inválida').optional()
)

const productFormSchema = z.object({
  sku: z.string().min(2, 'Mínimo 2 caracteres').max(60),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(150),
  type: z.enum(['PHYSICAL', 'DIGITAL']),
  price: z.coerce.number().positive('Debe ser mayor a 0'),
  categoryId: optionalId,
  imageUrl: optionalUrl,
  description: z.string().max(2000).optional().or(z.literal('')),
})

const emptyForm = { sku: '', name: '', type: 'PHYSICAL', price: '', categoryId: '', imageUrl: '', description: '' }

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [confirmOffId, setConfirmOffId] = useState(null)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['adminProducts', search],
    queryFn: () => adminListProducts({ search, limit: 50 }),
  })

  const { data: categoriesEnvelope } = useQuery({ queryKey: ['categories'], queryFn: adminListCategories })
  const categories = categoriesEnvelope?.data ?? []

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: emptyForm,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['adminProducts'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const saveMutation = useMutation({
    mutationFn: (values) =>
      editingId ? adminUpdateProduct(editingId, values) : adminCreateProduct(values),
    onSuccess: () => {
      invalidate()
      form.reset(emptyForm)
      setEditingId(null)
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }) => adminUpdateProduct(id, { active }),
    onSuccess: () => {
      invalidate()
      setConfirmOffId(null)
    },
  })

  const startEdit = (p) => {
    setEditingId(p.id)
    form.reset({
      sku: p.sku,
      name: p.name,
      type: p.type,
      price: String(p.price),
      categoryId: p.categoryId ? String(p.categoryId) : '',
      imageUrl: p.imageUrl || '',
      description: p.description || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const products = data?.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {data?.meta ? `${data.meta.total} producto(s) · incluye inactivos` : 'Cargando…'}
          </p>
        </div>
        <Input
          className="max-w-xs"
          placeholder="Buscar por nombre o SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar productos"
        />
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar productos: {error.message}</AlertDescription>
        </Alert>
      )}

      {/* Formulario alta/edición */}
      <section className="rounded-xl border bg-card p-4 md:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          {editingId ? <Pencil className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {editingId ? `Editar producto #${editingId}` : 'Nuevo producto'}
          {editingId && (
            <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); form.reset(emptyForm) }}>
              <X aria-hidden="true" />
              Cancelar
            </Button>
          )}
        </h2>

        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
          noValidate
        >
          {saveMutation.isError && (
            <Alert variant="destructive" className="sm:col-span-2 lg:col-span-3">
              <AlertDescription>{saveMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <Field label="SKU" error={form.formState.errors.sku?.message}>
            <Input id="sku" placeholder="Ej. TAZA-001" {...form.register('sku')} />
          </Field>

          <Field label="Nombre" error={form.formState.errors.name?.message}>
            <Input id="name" placeholder="Nombre del producto" {...form.register('name')} />
          </Field>

          <Field label="Tipo">
            <select
              id="type"
              className="h-9 rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              {...form.register('type')}
            >
              <option value="PHYSICAL">Físico</option>
              <option value="DIGITAL">Digital</option>
            </select>
          </Field>

          <Field label="Precio (COP)" error={form.formState.errors.price?.message}>
            <Input id="price" type="number" min="1" step="0.01" placeholder="19900" {...form.register('price')} />
          </Field>

          <Field label="Categoría">
            <select
              id="categoryId"
              className="h-9 rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              {...form.register('categoryId')}
            >
              <option value="">Sin categoría</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="URL de imagen (opcional)" error={form.formState.errors.imageUrl?.message}>
            <Input id="imageUrl" placeholder="https://…" {...form.register('imageUrl')} />
          </Field>

          <Field label="Descripción (opcional)" className="sm:col-span-2 lg:col-span-3">
            <textarea
              id="description"
              rows="2"
              className="flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              {...form.register('description')}
            />
          </Field>

          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              {editingId ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </form>
      </section>

      {/* Tabla */}
      {isPending ? (
        <div className="h-48 animate-pulse rounded-xl border bg-muted" aria-hidden="true" />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-muted-foreground">
                    No hay productos aún. Crea el primero con el formulario de arriba.
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="size-9 rounded-md object-cover" loading="lazy" />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Plus className="size-4" aria-hidden="true" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.categoryName || 'Sin categoría'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3">{p.type === 'DIGITAL' ? 'Digital' : 'Físico'}</td>
                  <td className="px-4 py-3">{formatCOP(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.active ? 'text-green-600' : 'text-destructive'}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(p)}>
                        Editar
                      </Button>
                      {confirmOffId === p.id ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={toggleActiveMutation.isPending}
                          onClick={() => toggleActiveMutation.mutate({ id: p.id, active: !p.active })}
                        >
                          {p.active ? '¿Confirmar desactivar?' : '¿Confirmar activar?'}
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setConfirmOffId(p.id)}>
                          <PowerOff aria-hidden="true" />
                          {p.active ? 'Desactivar' : 'Activar'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Field({ label, error, className, children }) {
  return (
    <div className={className}>
      <Label className="mb-1.5">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
