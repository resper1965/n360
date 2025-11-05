import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import CISODashboard from './pages/Dashboard/CISODashboard'
import AlertsPage from './pages/SOC/AlertsPage'
import AlertDetailPage from './pages/SOC/AlertDetailPage'
import ProblemsPage from './pages/NOC/ProblemsPage'
import ProblemDetailPage from './pages/NOC/ProblemDetailPage'
import TicketsPage from './pages/Tickets/TicketsPage'
import StatusPage from './pages/Status/StatusPage'
import GRCDashboard from './pages/GRC/GRCDashboard'
import RisksPage from './pages/GRC/RisksPage'
import ControlsPage from './pages/GRC/ControlsPage'
import PoliciesPage from './pages/GRC/PoliciesPage'
import RiskMatrixPage from './pages/GRC/RiskMatrixPage'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <ErrorBoundary>
      <Router>
        <div className="flex min-h-screen w-full">
        <Sidebar isOpen={sidebarOpen} />
        
        <div className="flex flex-1 flex-col ml-64">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<CISODashboard />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/soc/alerts" element={<AlertsPage />} />
              <Route path="/soc/alerts/:id" element={<AlertDetailPage />} />
              <Route path="/noc/problems" element={<ProblemsPage />} />
              <Route path="/noc/problems/:id" element={<ProblemDetailPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/grc" element={<GRCDashboard />} />
              <Route path="/grc/risks" element={<RisksPage />} />
              <Route path="/grc/risks/matrix" element={<RiskMatrixPage />} />
              <Route path="/grc/controls" element={<ControlsPage />} />
              <Route path="/grc/policies" element={<PoliciesPage />} />
            </Routes>
          </main>
        </div>
      </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App

