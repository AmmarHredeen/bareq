import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { BrandsPage } from '@/pages/BrandsPage';
import { StoragePage } from '@/pages/StoragePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UsersPage } from '@/pages/UsersPage';
import NewsletterPage from '@/pages/NewsletterPage'; 
import { OrdersPage } from '@/pages/OrdersPage';



export function AppRoutes() {
  return (
    <Routes>
      {/* مسارات المصادقة */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>

      {/* المسارات المحمية */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.ORDERS} element={<OrdersPage />} />   
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
          <Route path={ROUTES.BRANDS} element={<BrandsPage />} />
          <Route path={ROUTES.STORAGE} element={<StoragePage />} />
          <Route path={ROUTES.USERS} element={<UsersPage />} />
          <Route path={ROUTES.NEWSLETTER} element={<NewsletterPage />} />

        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/404" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
