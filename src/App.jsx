import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import AuthGate from './auth/AuthGate'
import LoginPage from './auth/LoginPage'
import Layout from './components/Layout'
import Workspace from './components/Workspace'
import HomePage from './pages/HomePage'
import ModulePage from './pages/ModulePage'
import AppViewer from './pages/AppViewer'
import LegalPage from './pages/LegalPage'

/**
 * Workspace routes nest inside a pathless <Workspace /> so the sidebar renders
 * once and the pane's own <Outlet /> is all that changes. Legal is a SIBLING of
 * Workspace, not a child, which is exactly what keeps the sidebar off it.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <AuthGate>
                <Layout />
              </AuthGate>
            }
          >
            <Route element={<Workspace />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/module/:moduleId" element={<ModulePage />} />
              <Route path="/module/:moduleId/app/:solutionId" element={<AppViewer />} />
            </Route>
            <Route path="/legal/:page" element={<LegalPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
