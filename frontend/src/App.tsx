import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PortalDashboard from './pages/PortalDashboard'
import Dashboard from './pages/Dashboard'
import LiveDetection from './pages/LiveDetection'
import ZoneMapPage from './pages/ZoneMapPage'
import AlertsPage from './pages/AlertsPage'
import AlertHistoryPage from './pages/AlertHistoryPage'
import AnalyticsPage from './pages/AnalyticsPage'
import DevicesPage from './pages/DevicesPage'
import PredictionsPage from './pages/PredictionsPage'
import AssistantPage from './pages/AssistantPage'
import SettingsPage from './pages/SettingsPage'
import LiveAlertsPage from './pages/LiveAlertsPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected app shell */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/app" element={<PortalDashboard />} />
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/live" element={<LiveAlertsPage />} />
        <Route path="/app/feeds" element={<LiveDetection />} />
        <Route path="/app/zones" element={<ZoneMapPage />} />
        <Route path="/app/alerts" element={<AlertsPage />} />
        <Route path="/app/history" element={<AlertHistoryPage />} />
        <Route path="/app/analytics" element={<AnalyticsPage />} />
        <Route path="/app/devices" element={<DevicesPage />} />
        <Route path="/app/predict" element={<PredictionsPage />} />
        <Route path="/app/assistant" element={<AssistantPage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
        <Route
          path="/app/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>
    </Routes>
  )
}
