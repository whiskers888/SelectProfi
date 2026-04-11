import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ProfilePage } from '../pages/ProfilePage'
import { ProtectedRoute, SessionEntryRedirect } from './RouteGuards'
import { routePaths } from './routePaths'
import { LoginPage } from '@/pages/LoginPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { VacanciesPage } from '@/pages/VacanciesPage'
import { WorkspacePage } from '@/pages/WorkspacePage'

export const router = createBrowserRouter([
  { path: routePaths.root, element: <SessionEntryRedirect /> },
  { path: routePaths.dashboardEntry, element: <SessionEntryRedirect /> },
  { path: routePaths.auth, element: <LoginPage /> },
  { path: routePaths.authJoin, element: <RegisterPage /> },
  { path: routePaths.app, element: <ProtectedRoute element={<WorkspacePage />} /> },
  { path: routePaths.orders, element: <ProtectedRoute element={<OrdersPage />} /> },
  { path: routePaths.vacancies, element: <ProtectedRoute element={<VacanciesPage />} /> },
  { path: routePaths.profile, element: <ProtectedRoute element={<ProfilePage />} /> },
  { path: routePaths.legacyLogin, element: <Navigate to={routePaths.auth} replace /> },
  { path: routePaths.legacyRegister, element: <Navigate to={routePaths.authJoin} replace /> },
  { path: routePaths.legacyApp, element: <Navigate to={routePaths.app} replace /> },
])
