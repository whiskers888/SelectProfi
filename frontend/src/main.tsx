import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { store } from './app/store'
import { NotificationsProvider } from './components/ui/notifications'
import './design/tokens.css'
import './style.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <NotificationsProvider>
        <RouterProvider router={router} />
      </NotificationsProvider>
    </Provider>
  </React.StrictMode>,
)
