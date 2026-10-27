import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, MapPin, ArrowRight, ClipboardList } from "lucide-react";
import StatusBadge from "../../components/StatusBadge.jsx";

const sampleComplaints = [
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
  {
    id: "UP-1021",
    title: "Blocked roadside drain",
    category: "Drainage",
    location: "Park Avenue",
    date: "15 Oct 2026",
    status: "Under Review",
  },
  {
    id: "UP-1020",
    title: "Low water pressure",
    category: "Water",
    location: "Sector 2",
    date: "12 Oct 2026",
    status: "Assigned",
  },
];

const filters = [
  "All",
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected",
];

export default function MyComplaints() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sampleComplaints.filter((complaint) => {
      const matchesSearch =
        complaint.title.toLowerCase().includes(query) ||
        complaint.id.toLowerCase().includes(query) ||
        complaint.category.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || complaint.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <main className="citizen-complaints-page">
      <header className="citizen-dashboard__header">
        <div>
          <p className="citizen-dashboard__eyebrow">CITIZEN PORTAL</p>
          <h1>My Complaints</h1>
          <p>View and track the issues you have reported.</p>
        </div>

        <Link
          to="/citizen/complaints/new"
          className="citizen-button citizen-button--primary"
        >
          <Plus size={18} />
          Report an Issue
        </Link>
      </header>

      <section className="citizen-complaints-panel">
        <div className="citizen-complaints-toolbar">
          <label className="citizen-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, ID, or category..."
              aria-label="Search complaints"
            />
          </label>

          <label className="citizen-status-filter">
            <span>Filter by status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {filters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="citizen-complaints-results">
          <p>
            Showing <strong>{filteredComplaints.length}</strong> of{" "}
            <strong>{sampleComplaints.length}</strong> complaints
          </p>
        </div>

        {filteredComplaints.length > 0 ? (
          <div className="citizen-complaints-list">
            {filteredComplaints.map((complaint) => (
              <article className="citizen-complaint-row" key={complaint.id}>
                <div className="citizen-complaint-row__icon">
                  <ClipboardList size={21} />
                </div>

                <div className="citizen-complaint-row__details">
                  <h2>{complaint.title}</h2>
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
                    View details <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="citizen-empty-state">
            <ClipboardList size={34} />
            <h2>No complaints found</h2>
            <p>Try another search term or select a different status.</p>
          </div>
        )}
      </section>
    </main>
  );
}
