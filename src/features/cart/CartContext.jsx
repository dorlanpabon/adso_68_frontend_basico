import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'adso_cart'
const CartContext = createContext(null)

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Carrito en estado local persistente.
 *  Los precios y totales reales SIEMPRE los recalcula el servidor al crear el
 *  pedido (Fase 7): este estado es solo la selección del comprador. */
export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo(() => {
    const addItem = (product, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((it) => it.productId === product.id)
        if (existing) {
          return prev.map((it) =>
            it.productId === product.id ? { ...it, quantity: it.quantity + quantity } : it
          )
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            type: product.type,
            quantity,
          },
        ]
      })
    }

    const setQuantity = (productId, quantity) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((it) => it.productId !== productId)
          : prev.map((it) => (it.productId === productId ? { ...it, quantity } : it))
      )
    }

    const removeItem = (productId) => setItems((prev) => prev.filter((it) => it.productId !== productId))
    const clear = () => setItems([])
    const count = items.reduce((acc, it) => acc + it.quantity, 0)

    return { items, addItem, setQuantity, removeItem, clear, count }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// oxlint-disable-next-line only-export-components -- El hook viaja con su provider por cohesión del contexto.
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
