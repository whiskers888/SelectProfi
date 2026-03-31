import { Navigate, createBrowserRouter } from 'react-router-dom'
import { App } from './App'
import { DashboardPage } from '../pages/DashboardPage'
import { ProfilePage } from '../pages/ProfilePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { PreviewPage } from '@/pages/PreviewPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/preview', element: <PreviewPage /> },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'auth', element: <Navigate to="/login" replace /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
])
