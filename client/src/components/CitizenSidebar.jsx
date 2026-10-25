import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Activity,
  LogOut,
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/citizen",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Report an Issue",
    path: "/citizen/complaints/new",
    icon: PlusCircle,
  },
  {
    label: "My Complaints",
    path: "/citizen/complaints",
    icon: ClipboardList,
  },
];

export default function CitizenSidebar() {
  return (
    <aside className="citizen-sidebar">
      <div className="citizen-sidebar__brand">
        <Activity size={27} aria-hidden="true" />
        <span>UrbanPulse</span>
      </div>

      <p className="citizen-sidebar__section-label">CITIZEN PORTAL</p>

      <nav className="citizen-sidebar__nav" aria-label="Citizen navigation">
        {navigationItems.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={true}
            className={({ isActive }) =>
              `citizen-sidebar__link${isActive ? " is-active" : ""}`
            }
          >
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="citizen-sidebar__footer">
        <NavLink to="/login" className="citizen-sidebar__link">
          <LogOut size={19} aria-hidden="true" />
          <span>Back to Login</span>
        </NavLink>
      </div>
    </aside>
  );
}
