import { Link } from "react-router-dom";
import {
  Plus,
  ClipboardList,
  Clock3,
  CheckCircle2,
  ArrowRight,
  MapPin,
  FileText,
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge.jsx";

const stats = [
  {
    label: "Total Complaints",
    value: 12,
    icon: ClipboardList,
    color: "blue",
  },
  {
    label: "Pending",
    value: 5,
    icon: Clock3,
    color: "orange",
  },
  {
    label: "In Progress",
    value: 3,
    icon: FileText,
    color: "purple",
  },
  {
    label: "Resolved",
    value: 4,
    icon: CheckCircle2,
    color: "green",
  },
];

const recentComplaints = [
  {
    id: "UP-1024",
    title: "Streetlight not working",
    category: "Electricity",
    location: "Main Road",
    date: "20 Oct 2026",
    status: "In Progress",
  },
  {
    id: "UP-1023",
    title: "Garbage collection missed",
    category: "Sanitation",
    location: "Sector 4",
    date: "19 Oct 2026",
    status: "Submitted",
  },
  {
    id: "UP-1022",
    title: "Pothole on main road",
    category: "Roads",
    location: "Market Street",
    date: "17 Oct 2026",
    status: "Resolved",
  },
];

export default function CitizenDashboard() {
  return (
    <main className="citizen-dashboard">
      <header className="citizen-dashboard__header">
        <div>
          <p className="citizen-dashboard__eyebrow">CITIZEN PORTAL</p>
          <h1>Welcome back!</h1>
          <p>Report issues and track improvements in your community.</p>
        </div>

        <Link
          to="/citizen/complaints/new"
          className="citizen-button citizen-button--primary"
        >
          <Plus size={18} />
          Report an Issue
        </Link>
      </header>

      <section className="citizen-stats" aria-label="Complaint statistics">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <article className="citizen-stat-card" key={label}>
            <div className={`citizen-stat-card__icon ${color}`}>
              <Icon size={21} />
            </div>
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="citizen-dashboard__section">
        <div className="citizen-section-heading">
          <div>
            <h2>Recent Complaints</h2>
            <p>Check the latest updates on your reported issues.</p>
          </div>

          <Link to="/citizen/complaints" className="citizen-text-link">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="citizen-complaints-list">
          {recentComplaints.map((complaint) => (
            <article className="citizen-complaint-row" key={complaint.id}>
              <div className="citizen-complaint-row__icon">
                <FileText size={21} />
              </div>

              <div className="citizen-complaint-row__details">
                <h3>{complaint.title}</h3>
                <p>
                  {complaint.id} · {complaint.category}
                </p>
                <p className="citizen-complaint-row__location">
                  <MapPin size={14} />
                  {complaint.location} · {complaint.date}
                </p>
              </div>

              <div className="citizen-complaint-row__status">
                <StatusBadge status={complaint.status} />
                <Link
                  to={`/citizen/complaints/${complaint.id}`}
                  className="citizen-text-link"
                >
                  Details <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
