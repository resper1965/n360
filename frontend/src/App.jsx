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
import RiskForm from './pages/GRC/RiskForm'
import ControlsPage from './pages/GRC/ControlsPage'
import ControlForm from './pages/GRC/ControlForm'
import PoliciesPage from './pages/GRC/PoliciesPage'
import PolicyForm from './pages/GRC/PolicyForm'
import RiskMatrixPage from './pages/GRC/RiskMatrixPage'
import TicketForm from './pages/Tickets/TicketForm'
import AssetsPage from './pages/GRC/AssetsPage'
import AssetForm from './pages/GRC/AssetForm'
import ThreatsPage from './pages/GRC/ThreatsPage'

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
              <Route path="/grc/risks/new" element={<RiskForm />} />
              <Route path="/grc/risks/edit/:id" element={<RiskForm />} />
              <Route path="/grc/risks/matrix" element={<RiskMatrixPage />} />
              <Route path="/grc/controls" element={<ControlsPage />} />
              <Route path="/grc/controls/new" element={<ControlForm />} />
              <Route path="/grc/controls/edit/:id" element={<ControlForm />} />
              <Route path="/grc/policies" element={<PoliciesPage />} />
              <Route path="/grc/policies/new" element={<PolicyForm />} />
              <Route path="/grc/policies/edit/:id" element={<PolicyForm />} />
              <Route path="/tickets/new" element={<TicketForm />} />
              <Route path="/tickets/edit/:id" element={<TicketForm />} />
              <Route path="/grc/assets" element={<AssetsPage />} />
              <Route path="/grc/assets/new" element={<AssetForm />} />
              <Route path="/grc/assets/edit/:id" element={<AssetForm />} />
              <Route path="/grc/threats" element={<ThreatsPage />} />
            </Routes>
          </main>
        </div>
      </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App

