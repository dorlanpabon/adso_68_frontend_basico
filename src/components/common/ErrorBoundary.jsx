import { Component } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

/** ErrorBoundary: captura errores de render de React y muestra una vista
 *  amigable en lugar de una pantalla en blanco. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Sin datos privados: solo el mensaje y el stack del componente.
    console.error('[ErrorBoundary]', error.message, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
          <p className="text-5xl">😵</p>
          <h1 className="text-xl font-semibold">Algo salió mal</h1>
          <p className="text-sm text-muted-foreground">
            Ocurrió un error inesperado en esta página. Intenta de nuevo.
          </p>
          <Button asChild>
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
