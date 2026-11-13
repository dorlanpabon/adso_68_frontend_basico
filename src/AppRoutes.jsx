import { Route, Routes } from 'react-router'
import { PublicLayout } from '@/components/layout/PublicLayout'
import HomePage from '@/pages/public/HomePage'
import CatalogPage from '@/pages/public/CatalogPage'
import ProductDetailPage from '@/pages/public/ProductDetailPage'
import CartPage from '@/pages/public/CartPage'
import CheckoutPage from '@/pages/public/CheckoutPage'
import OrderDetailPage from '@/pages/public/OrderDetailPage'
import MyOrdersPage from '@/pages/public/MyOrdersPage'
import NotFoundPage from '@/pages/public/NotFoundPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import RequireAdmin from '@/pages/admin/RequireAdmin'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import AdminProductsPage from '@/pages/admin/AdminProductsPage'
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage'
import AdminInventoryPage from '@/pages/admin/AdminInventoryPage'

function AppRoutes() {
  return (
    <Routes>
      {/* Público */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<CatalogPage />} />
        <Route path="/productos/:slug" element={<ProductDetailPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedido/:id" element={<OrderDetailPage />} />
        <Route path="/mis-pedidos" element={<MyOrdersPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Administrativo (guard RequireAdmin; la autorización real es backend) */}
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path="/admin/productos" element={<AdminProductsPage />} />
        <Route path="/admin/categorias" element={<AdminCategoriesPage />} />
        <Route path="/admin/inventario" element={<AdminInventoryPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
