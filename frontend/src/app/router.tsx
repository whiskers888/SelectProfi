import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AvailabilityRoute, ProtectedRoute, SessionEntryRedirect } from './RouteGuards'
import { routePaths } from './routePaths'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ServiceUnavailablePage } from '@/pages/ServiceUnavailablePage'
import { WorkspacePage } from '@/pages/WorkspacePage'

export const router = createBrowserRouter([
  { path: routePaths.root, element: <AvailabilityRoute element={<SessionEntryRedirect />} /> },
  {
    path: routePaths.dashboardEntry,
    element: <AvailabilityRoute element={<SessionEntryRedirect />} />,
  },
  { path: routePaths.auth, element: <AvailabilityRoute element={<LoginPage />} /> },
  { path: routePaths.authJoin, element: <AvailabilityRoute element={<RegisterPage />} /> },
  {
    path: routePaths.app,
    element: <AvailabilityRoute element={<ProtectedRoute element={<WorkspacePage />} />} />,
  },
  {
    path: routePaths.orders,
    element: <AvailabilityRoute element={<Navigate to={routePaths.app} replace />} />,
  },
  // @dvnull: Ранее route /vacancies открывал отдельный legacy-экран; пользовательский вход перенесен в workspace.
  {
    path: routePaths.vacancies,
    element: <AvailabilityRoute element={<Navigate to={routePaths.app} replace />} />,
  },
  {
    path: routePaths.profile,
    element: <AvailabilityRoute element={<ProtectedRoute element={<WorkspacePage />} />} />,
  },
  {
    path: routePaths.legacyLogin,
    element: <AvailabilityRoute element={<Navigate to={routePaths.auth} replace />} />,
  },
  {
    path: routePaths.legacyRegister,
    element: <AvailabilityRoute element={<Navigate to={routePaths.authJoin} replace />} />,
  },
  {
    path: routePaths.legacyApp,
    element: <AvailabilityRoute element={<Navigate to={routePaths.app} replace />} />,
  },
  { path: routePaths.serviceUnavailable, element: <ServiceUnavailablePage /> },
  { path: '*', element: <AvailabilityRoute element={<SessionEntryRedirect />} /> },
])
