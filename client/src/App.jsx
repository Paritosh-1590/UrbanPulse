import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CitizenSidebar from './components/CitizenSidebar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CitizenDashboard from './pages/citizen/CitizenDashboard.jsx';
import NewComplaint from './pages/citizen/NewComplaint.jsx';
import MyComplaints from './pages/citizen/MyComplaints.jsx';
import ComplaintDetails from './pages/citizen/ComplaintDetails.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminComplaintDetails from './pages/admin/AdminComplaintDetails.jsx';
import AdminMapPage from './pages/admin/AdminMapPage.jsx';
import './pages/citizen/citizen.css';
import './pages/admin/admin.css';

function WorkspaceLayout({ admin = false }) {
  return (
    <div className="citizen-layout">
      <CitizenSidebar admin={admin} />
      <div className="citizen-layout__content"><Outlet /></div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage initialMode="register" />} />

      <Route path="/citizen" element={<ProtectedRoute roles={['citizen']}><WorkspaceLayout /></ProtectedRoute>}>
        <Route index element={<CitizenDashboard />} />
        <Route path="complaints/new" element={<NewComplaint />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="complaints/:id" element={<ComplaintDetails />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute roles={['admin', 'department_official']}><WorkspaceLayout admin /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="map" element={<AdminMapPage />} />
        <Route path="complaints/:id" element={<AdminComplaintDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
