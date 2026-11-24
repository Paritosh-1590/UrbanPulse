import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, PlusCircle, ClipboardList, LogOut, Users, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';

export default function CitizenSidebar({ admin = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isOfficial = user?.role === 'department_official';

  const items = admin
    ? [
        {
          label: isOfficial ? 'Department queue' : 'Overview',
          path: '/admin',
          icon: LayoutDashboard,
          active:
            location.pathname === '/admin' ||
            (location.pathname.startsWith('/admin/complaints') && !location.pathname.startsWith('/admin/map')),
        },
        {
          label: 'Issue Map',
          path: '/admin/map',
          icon: MapPin,
          active: location.pathname === '/admin/map',
        },
      ]
    : [
        {
          label: 'Dashboard',
          path: '/citizen',
          icon: LayoutDashboard,
          active: location.pathname === '/citizen',
        },
        {
          label: 'Report an Issue',
          path: '/citizen/complaints/new',
          icon: PlusCircle,
          active: location.pathname === '/citizen/complaints/new',
        },
        {
          label: 'My Complaints',
          path: '/citizen/complaints',
          icon: ClipboardList,
          active:
            location.pathname === '/citizen/complaints' ||
            (location.pathname.startsWith('/citizen/complaints/') && location.pathname !== '/citizen/complaints/new'),
        },
      ];

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="citizen-sidebar">
      <NavLink to={admin ? '/admin' : '/citizen'} className="citizen-sidebar__brand">
        <Activity size={27} aria-hidden="true" /><span>UrbanPulse</span>
      </NavLink>
      <p className="citizen-sidebar__section-label">{admin ? (isOfficial ? 'DEPARTMENT WORKSPACE' : 'ADMIN WORKSPACE') : 'CITIZEN PORTAL'}</p>
      <nav className="citizen-sidebar__nav" aria-label="Workspace navigation">
        {items.map(({ label, path, icon: Icon, active }) => (
          <NavLink key={path} to={path} className={`citizen-sidebar__link${active ? ' is-active' : ''}`}>
            <Icon size={19} aria-hidden="true" /><span>{label}</span>
          </NavLink>
        ))}
        {admin && <div className="citizen-sidebar__role-note"><ShieldCheck size={16} />{isOfficial ? user?.department : 'Administrator access'}</div>}
      </nav>
      <div className="citizen-sidebar__footer">
        <div className="citizen-sidebar__user"><span className="citizen-sidebar__avatar">{(user?.name || 'U').slice(0, 1).toUpperCase()}</span><span><strong>{user?.name || 'User'}</strong><small>{user?.email || ''}</small></span></div>
        <button type="button" className="citizen-sidebar__link citizen-sidebar__logout" onClick={handleLogout}><LogOut size={19} /><span>Sign out</span></button>
      </div>
    </aside>
  );
}
