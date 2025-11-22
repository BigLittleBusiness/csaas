import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/ErrorBoundary'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import CustomerList from '@/components/CustomerList'
import CustomerDetail from '@/components/CustomerDetail'
import PlaybookList from '@/components/PlaybookList'
import PlaybookDetail from '@/components/PlaybookDetail'
import Login from '@/components/auth/Login'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminDashboard from '@/components/admin/AdminDashboard'
import UserManagement from '@/components/admin/UserManagement'
import UserDetail from '@/components/admin/UserDetail'
import OrganizationSettings from '@/components/admin/OrganizationSettings'
import Analytics from '@/components/admin/Analytics'
import AuditLog from '@/components/admin/AuditLog'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    setIsAuthenticated(!!token)
  }, [])

  const handleLogin = (user) => {
    setIsAuthenticated(true)
  }

  return (
    <ErrorBoundary>
      <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          } 
        />

        {/* Protected routes with sidebar */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-[#F1F5F9] flex">
                <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                
                <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
                  <main className="p-6">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/customers" element={<CustomerList />} />
                      <Route path="/customers/:id" element={<CustomerDetail />} />
                      <Route path="/playbooks" element={<PlaybookList />} />
                      <Route path="/playbooks/:id" element={<PlaybookDetail />} />
                      
                      {/* Admin routes */}
                      <Route 
                        path="/admin/dashboard" 
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/users" 
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <UserManagement />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/users/:userId" 
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <UserDetail />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/organization" 
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <OrganizationSettings />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/analytics" 
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <Analytics />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/audit-log" 
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <AuditLog />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </main>
                </div>
                
                <Toaster />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
