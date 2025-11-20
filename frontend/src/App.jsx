import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import CustomerList from '@/components/CustomerList'
import CustomerDetail from '@/components/CustomerDetail'
import PlaybookList from '@/components/PlaybookList'
import PlaybookDetail from '@/components/PlaybookDetail'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
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
            </Routes>
          </main>
        </div>
        
        <Toaster />
      </div>
    </Router>
  )
}

export default App

