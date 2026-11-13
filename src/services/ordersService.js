import { api, buildQuery } from '@/lib/api'

/* Pedidos — el backend recalcula totales y descuenta inventario de forma
 * transaccional; la clave de idempotencia protege contra reintentos. */

/** Checkout: {items:[{productId,quantity}], customer:{name,email,phone}, idempotencyKey} */
export const checkout = (data) => api.post('/api/v1/orders/checkout', data)

/** Pedidos del usuario autenticado. params: {page, limit} */
export const getMyOrders = (params = {}) => api.get(`/api/v1/orders/mine${buildQuery(params)}`)

/** Detalle (propietario o ADMIN). */
export const getOrder = (id) => api.get(`/api/v1/orders/${id}`)

/** Cancelar pedido propio (restaura stock de ítems físicos). */
export const cancelOrder = (id) => api.post(`/api/v1/orders/${id}/cancel`, {})
