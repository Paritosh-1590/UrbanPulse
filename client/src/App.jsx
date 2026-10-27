import { Navigate, Route, Routes } from 'react-router-dom'

import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import './pages/citizen/citizen.css'
import CitizenSidebar from './components/CitizenSidebar.jsx'
import CitizenDashboard from './pages/citizen/CitizenDashboard.jsx'
import NewComplaint from './pages/citizen/NewComplaint.jsx'
import MyComplaints from './pages/citizen/MyComplaints.jsx'
import ComplaintDetails from './pages/citizen/ComplaintDetails.jsx'

function CitizenLayout({ children }) {
  return (
    <div className="citizen-layout">
      <CitizenSidebar />
      <div className="citizen-layout__content">
        {children}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Existing pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Citizen pages */}
      <Route
        path="/citizen"
        element={
          <CitizenLayout>
            <CitizenDashboard />
          </CitizenLayout>
        }
      />

      <Route
        path="/citizen/complaints/new"
        element={
          <CitizenLayout>
            <NewComplaint />
          </CitizenLayout>
        }
      />

      <Route
        path="/citizen/complaints"
        element={
          <CitizenLayout>
            <MyComplaints />
          </CitizenLayout>
        }
      />

      <Route
        path="/citizen/complaints/:id"
        element={
          <CitizenLayout>
            <ComplaintDetails />
          </CitizenLayout>
        }
      />

      {/* Unknown URLs return to the landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}