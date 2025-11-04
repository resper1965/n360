import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import CISODashboard from './pages/Dashboard/CISODashboard'
import AlertsPage from './pages/SOC/AlertsPage'
import ProblemsPage from './pages/NOC/ProblemsPage'
import TicketsPage from './pages/Tickets/TicketsPage'
import StatusPage from './pages/Status/StatusPage'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <Router>
      <div className="flex h-screen bg-ness-dark">
        <Sidebar isOpen={sidebarOpen} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<CISODashboard />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/soc/alerts" element={<AlertsPage />} />
              <Route path="/noc/problems" element={<ProblemsPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App

