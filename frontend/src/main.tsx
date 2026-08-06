import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './context/ToastContext'
import { AppProvider } from './context/AppContext'
import { DataProvider } from './context/DataContext'
import { AuthProvider } from './context/AuthContext'
import { LiveAlertProvider } from './context/LiveAlertContext'
import { LanguageProvider } from './i18n/LanguageContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <AppProvider>
          <DataProvider>
            <AuthProvider>
              <LiveAlertProvider>
                <LanguageProvider>
                  <App />
                </LanguageProvider>
              </LiveAlertProvider>
            </AuthProvider>
          </DataProvider>
        </AppProvider>
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>,
)