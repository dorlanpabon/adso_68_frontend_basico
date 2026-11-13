import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { adminCreateCategory, adminListCategories, adminUpdateCategory } from '@/services/catalogService'
import { z } from 'zod'

const categoryFormSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
})

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState(null)

  const { data: envelope, isPending, isError, error } = useQuery({
    queryKey: ['categories'],
    queryFn: adminListCategories,
  })
  const categories = envelope?.data ?? []

  const form = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '' },
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] })

  const saveMutation = useMutation({
    mutationFn: (values) =>
      editingId ? adminUpdateCategory(editingId, values) : adminCreateCategory(values),
    onSuccess: () => {
      invalidate()
      form.reset({ name: '' })
      setEditingId(null)
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }) => adminUpdateCategory(id, { active }),
    onSuccess: invalidate,
  })

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
        <p className="text-sm text-muted-foreground">Organiza el catálogo por categorías.</p>
      </div>

      <section className="rounded-xl border bg-card p-4 md:p-6">
        <h2 className="mb-4 font-semibold">
          {editingId ? `Editar categoría #${editingId}` : 'Nueva categoría'}
        </h2>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
          noValidate
        >
          <div className="flex-1">
            <Label className="mb-1.5">Nombre</Label>
            <Input id="name" placeholder="Ej. Hogar y Cocina" {...form.register('name')} />
            {(form.formState.errors.name?.message || saveMutation.error) && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.name?.message || saveMutation.error?.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={saveMutation.isPending} className="sm:mt-6">
            {saveMutation.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {editingId ? 'Guardar' : 'Crear'}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              className="sm:mt-6"
              onClick={() => {
                setEditingId(null)
                form.reset({ name: '' })
              }}
            >
              Cancelar
            </Button>
          )}
        </form>
      </section>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar categorías: {error.message}</AlertDescription>
        </Alert>
      )}

      {isPending ? (
        <div className="h-32 animate-pulse rounded-xl border bg-muted" aria-hidden="true" />
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.length === 0 && (
            <li className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
              Aún no hay categorías.
            </li>
          )}
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 rounded-xl border bg-card p-3">
              <div>
                <span className="font-medium">{c.name}</span>
                <span className="ml-2 font-mono text-xs text-muted-foreground">{c.slug}</span>
                {!c.active && <span className="ml-2 text-xs text-destructive">inactiva</span>}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(c.id)
                    form.reset({ name: c.name })
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={toggleActiveMutation.isPending}
                  onClick={() => toggleActiveMutation.mutate({ id: c.id, active: !c.active })}
                >
                  {c.active ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
