import { api, buildQuery } from '@/lib/api'

/* Módulo de inventario — todo requiere rol ADMIN o WAREHOUSE (lo valida el backend). */

/** Bodegas activas. */
export const getWarehouses = () => api.get('/api/v1/inventory/warehouses')

/** Saldos físicos por producto/bodega. params: {warehouseId, productId, lowStock, page, limit} */
export const getBalances = (params = {}) => api.get(`/api/v1/inventory/balances${buildQuery(params)}`)

/** Kardex de movimientos. params: {productId, warehouseId, type, page, limit} */
export const getMovements = (params = {}) => api.get(`/api/v1/inventory/movements${buildQuery(params)}`)

/** Registra un movimiento IN/OUT/ADJUST (transaccional en el backend). */
export const createMovement = (data) => api.post('/api/v1/inventory/movements', data)
