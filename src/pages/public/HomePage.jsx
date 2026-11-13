import { Link } from 'react-router'
import { ArrowRight, PackageSearch, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: PackageSearch,
    title: 'Catálogo claro',
    text: 'Productos físicos y digitales con descripciones, precios y disponibilidad reales.',
  },
  {
    icon: ShieldCheck,
    title: 'Pedidos seguros',
    text: 'Tus datos viajan autenticados y cada pedido queda registrado con estado trazable.',
  },
  {
    icon: Truck,
    title: 'Gestión de bodega',
    text: 'Inventario por bodega con movimientos auditados: entradas, salidas y ajustes.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:py-28">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            Tienda virtual y gestión de bodega
          </span>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Compra fácil. Inventario bajo control.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Un solo lugar para explorar el catálogo, hacer tus pedidos y mantener
            las existencias de la bodega siempre actualizadas.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/productos">
                Explorar catálogo
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/registro">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">¿Por qué usar la tienda?</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardContent className="flex flex-col gap-3">
                <f.icon className="size-8 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}
