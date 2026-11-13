import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Formatea un valor para pesos colombianos (extensible a otras monedas).
 *  El backend envía DECIMAL como string; se normaliza a número. */
export function formatCOP(value) {
  const num = Number(value ?? 0)
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(num) ? num : 0)
}
