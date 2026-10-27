import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock3,
  FileText,
  CheckCircle2,
  Circle,
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge.jsx";

const sampleComplaints = {
  "UP-1024": {
    id: "UP-1024",
    title: "Streetlight not working",
    category: "Electricity",
    location: "Main Road",
    description:
      "The streetlight near the main road crossing has not been working for several days, making the area difficult to navigate at night.",
    date: "20 Oct 2026",
    status: "In Progress",
    slaDeadline: "23 Oct 2026",
    history: [
      {
        title: "Complaint submitted",
        date: "20 Oct 2026",
        description: "The complaint was received.",
        complete: true,
      },
      {
        title: "Complaint reviewed",
        date: "20 Oct 2026",
        description: "The issue was reviewed by the relevant team.",
        complete: true,
      },
      {
        title: "Work in progress",
        date: "21 Oct 2026",
        description: "The complaint is being worked on.",
        complete: true,
      },
      {
        title: "Issue resolved",
        date: "Pending",
        description: "Awaiting resolution confirmation.",
        complete: false,
      },
    ],
  },
  "UP-1023": {
    id: "UP-1023",
    title: "Garbage collection missed",
    category: "Sanitation",
    location: "Sector 4",
    description: "Scheduled garbage collection was missed in this area.",
    date: "19 Oct 2026",
    status: "Submitted",
    slaDeadline: "Not available",
    history: [
      {
        title: "Complaint submitted",
        date: "19 Oct 2026",
        description: "The complaint was received.",
        complete: true,
      },
    ],
  },
  "UP-1022": {
    id: "UP-1022",
    title: "Pothole on main road",
    category: "Roads",
    location: "Market Street",
    description: "A pothole is affecting traffic on Market Street.",
    date: "17 Oct 2026",
    status: "Resolved",
    slaDeadline: "Not available",
    history: [
      {
        title: "Complaint submitted",
        date: "17 Oct 2026",
        description: "The complaint was received.",
        complete: true,
      },
      {
        title: "Issue resolved",
        date: "18 Oct 2026",
        description: "Marked resolved in the sample record.",
        complete: true,
      },
    ],
  },
};

export default function ComplaintDetails() {
  const { id } = useParams();
  const complaint = sampleComplaints[id];

  if (!complaint) {
    return (
      <main className="citizen-details-page">
        <Link to="/citizen/complaints" className="citizen-back-link">
          <ArrowLeft size={17} />
          Back to My Complaints
        </Link>
        <section className="citizen-form-card">
          <h1>Complaint not found</h1>
          <p>
            This ID does not exist in the current sample records. Real complaint
            lookup will be connected to the backend later.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="citizen-details-page">
      <Link to="/citizen/complaints" className="citizen-back-link">
        <ArrowLeft size={17} />
        Back to My Complaints
      </Link>

      <header className="citizen-details-header">
        <div>
          <p className="citizen-dashboard__eyebrow">COMPLAINT {complaint.id}</p>
          <h1>{complaint.title}</h1>
          <p>Submitted on {complaint.date}</p>
        </div>
        <StatusBadge status={complaint.status} />
      </header>

      <div className="citizen-details-grid">
        <section className="citizen-form-card">
          <div className="citizen-form-card__heading">
            <h2>Complaint Information</h2>
            <p>Details provided with this report.</p>
          </div>

          <div className="citizen-detail-item">
            <FileText size={19} />
            <div>
              <span>Category</span>
              <strong>{complaint.category}</strong>
            </div>
          </div>

          <div className="citizen-detail-item">
            <MapPin size={19} />
            <div>
              <span>Location</span>
              <strong>{complaint.location}</strong>
            </div>
          </div>

          <div className="citizen-detail-item">
            <CalendarDays size={19} />
            <div>
              <span>Date submitted</span>
              <strong>{complaint.date}</strong>
            </div>
          </div>

          <div className="citizen-details-description">
            <h3>Description</h3>
            <p>{complaint.description}</p>
          </div>
        </section>

        <aside className="citizen-form-card citizen-sla-card">
          <div className="citizen-form-card__heading">
            <h2>Resolution target</h2>
            <p>Sample SLA information</p>
          </div>

          <div className="citizen-sla-card__deadline">
            <Clock3 size={21} />
            <div>
              <span>Target deadline</span>
              <strong>{complaint.slaDeadline}</strong>
            </div>
          </div>

          <p className="citizen-form-hint">
            This is placeholder information, not a live SLA calculation.
          </p>
        </aside>
      </div>

      <section className="citizen-form-card citizen-history">
        <div className="citizen-form-card__heading">
          <h2>Status History</h2>
          <p>Sample timeline for this complaint.</p>
        </div>

        <ol className="citizen-history__list">
          {complaint.history.map((item, index) => {
            const Icon = item.complete ? CheckCircle2 : Circle;

            return (
              <li
                className={`citizen-history__item ${
                  item.complete ? "is-complete" : ""
                }`}
                key={`${item.title}-${index}`}
              >
                <Icon size={21} aria-hidden="true" />

                <div>
                  <div className="citizen-history__heading">
                    <h3>{item.title}</h3>
                    <span>{item.date}</span>
                  </div>
                  <p>{item.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
