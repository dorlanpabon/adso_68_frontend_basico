import { api, buildQuery } from '@/lib/api'

/** Catálogo público (solo activos). params: {page,limit,search,category,type,sort} */
export const listProducts = (params = {}) => api.get(`/api/v1/products${buildQuery(params)}`)

/** Detalle público por id o slug. */
export const getProduct = (idOrSlug) => api.get(`/api/v1/products/${encodeURIComponent(idOrSlug)}`)

/** Categorías activas (público). */
export const listCategories = () => api.get('/api/v1/categories')

/* ---- Administración (requiere rol ADMIN) ---- */

export const adminListProducts = (params = {}) => api.get(`/api/v1/products/admin${buildQuery(params)}`)

export const adminCreateProduct = (data) => api.post('/api/v1/products', data)

export const adminUpdateProduct = (id, data) => api.patch(`/api/v1/products/${id}`, data)

export const adminCreateCategory = (data) => api.post('/api/v1/categories', data)

export const adminUpdateCategory = (id, data) => api.patch(`/api/v1/categories/${id}`, data)

/** Listado admin de categorías: por ahora usa la pública (solo activas).
 *  Limitación documentada: la lista de inactivas llega en fases posteriores. */
export const adminListCategories = () => listCategories()
