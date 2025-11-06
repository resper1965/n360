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
import { PostureManagementPage } from './pages/SOC/PostureManagementPage'
import { VulnerabilitiesPage } from './pages/GRC/VulnerabilitiesPage'
import { VulnerabilityForm } from './pages/GRC/VulnerabilityForm'
import { RiskEnginePage } from './pages/GRC/RiskEnginePage'
import { IncidentsPage } from './pages/GRC/IncidentsPage'
import { CompliancePage } from './pages/GRC/CompliancePage'
import { ThreatForm } from './pages/GRC/ThreatForm'
import { IncidentForm } from './pages/GRC/IncidentForm'

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
              <Route path="/soc/posture" element={<PostureManagementPage />} />
              <Route path="/noc/problems" element={<ProblemsPage />} />
              <Route path="/noc/problems/:id" element={<ProblemDetailPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/grc" element={<GRCDashboard />} />
              <Route path="/grc/risks" element={<RisksPage />} />
              <Route path="/grc/risks/new" element={<RiskForm />} />
              <Route path="/grc/risks/edit/:id" element={<RiskForm />} />
              <Route path="/grc/risks/matrix" element={<RiskMatrixPage />} />
              <Route path="/grc/risk-engine" element={<RiskEnginePage />} />
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
              <Route path="/grc/threats/new" element={<ThreatForm />} />
              <Route path="/grc/threats/edit/:id" element={<ThreatForm />} />
              <Route path="/grc/vulnerabilities" element={<VulnerabilitiesPage />} />
              <Route path="/grc/vulnerabilities/new" element={<VulnerabilityForm />} />
              <Route path="/grc/vulnerabilities/edit/:id" element={<VulnerabilityForm />} />
              <Route path="/grc/incidents" element={<IncidentsPage />} />
              <Route path="/grc/incidents/new" element={<IncidentForm />} />
              <Route path="/grc/incidents/edit/:id" element={<IncidentForm />} />
              <Route path="/grc/compliance" element={<CompliancePage />} />
            </Routes>
          </main>
        </div>
      </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App

