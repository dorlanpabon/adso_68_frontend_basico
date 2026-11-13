import { api, buildQuery } from '@/lib/api'

/* Reportes del dashboard — solo ADMIN (lo valida el backend). */

export const getDashboard = (params = {}) => api.get(`/api/v1/reports/dashboard${buildQuery(params)}`)
