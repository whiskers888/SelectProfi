import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ProfilePage } from '../pages/ProfilePage'
import { ProtectedRoute, SessionEntryRedirect } from './RouteGuards'
import { routePaths } from './routePaths'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { PreviewPage } from '@/pages/PreviewPage'

export const router = createBrowserRouter([
  { path: routePaths.root, element: <SessionEntryRedirect /> },
  { path: routePaths.dashboardEntry, element: <SessionEntryRedirect /> },
  { path: routePaths.auth, element: <LoginPage /> },
  { path: routePaths.authJoin, element: <RegisterPage /> },
  { path: routePaths.app, element: <ProtectedRoute element={<PreviewPage />} /> },
  { path: routePaths.profile, element: <ProtectedRoute element={<ProfilePage />} /> },
  { path: routePaths.legacyLogin, element: <Navigate to={routePaths.auth} replace /> },
  { path: routePaths.legacyRegister, element: <Navigate to={routePaths.authJoin} replace /> },
  { path: routePaths.legacyPreview, element: <Navigate to={routePaths.app} replace /> },
])
