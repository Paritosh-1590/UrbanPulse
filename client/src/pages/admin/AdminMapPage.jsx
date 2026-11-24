import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Search,
  AlertTriangle,
  RefreshCw,
  Clock3,
  CalendarDays,
  FileText,
  Layers,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { apiRequest } from '../../lib/api.js';
import {
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  getComplaintPinIcon,
} from '../../components/map/leafletSetup.js';
import '../../components/map/map.css';
import './admin.css';

const STATUSES = ['All', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
const CATEGORIES = ['All', 'Roads', 'Sanitation', 'Water', 'Electricity', 'Drainage', 'Other'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High'];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

/**
 * Automatically pans and zooms map to fit all visible complaint markers.
 */
function FitBoundsToMarkers({ items }) {
  const map = useMap();

  useEffect(() => {
    if (!items || items.length === 0) return;

    const latLngs = items
      .filter(
        (item) =>
          item.geoLocation &&
          Array.isArray(item.geoLocation.coordinates) &&
          item.geoLocation.coordinates.length === 2,
      )
      .map((item) => [
        item.geoLocation.coordinates[1],
        item.geoLocation.coordinates[0],
      ]);

    if (latLngs.length === 0) return;

    if (latLngs.length === 1) {
      map.setView(latLngs[0], 14, { animate: true });
    } else {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    }
  }, [items, map]);

  return null;
}

export default function AdminMapPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [department, setDepartment] = useState('All');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadMapData() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (status !== 'All') params.set('status', status);
      if (category !== 'All') params.set('category', category);
      if (priority !== 'All') params.set('priority', priority);
      if (isAdmin && department !== 'All') params.set('assignedDepartment', department);
      if (overdueOnly) params.set('overdue', 'true');

      const [mapData, deptData] = await Promise.all([
        apiRequest(`/admin/map-complaints?${params.toString()}`),
        isAdmin ? apiRequest('/admin/departments') : Promise.resolve({ departments: [] }),
      ]);

      setItems(mapData.items || []);
      if (isAdmin && deptData?.departments) {
        setDepartments(deptData.departments);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMapData();
  }, [search, status, category, priority, department, overdueOnly]);

  return (
    <main className="admin-page admin-map-page">
      <header className="admin-header">
        <div>
          <p className="citizen-dashboard__eyebrow">
            {isAdmin ? 'ADMIN WORKSPACE' : 'DEPARTMENT WORKSPACE'} · MAP OVERVIEW
          </p>
          <h1>Civic Issue Map</h1>
          <p>
            {isAdmin
              ? 'Geographic view of geo-tagged complaints across all city departments.'
              : `Geographic view of geo-tagged complaints assigned to ${user?.department || 'your department'}.`}
          </p>
        </div>
      </header>

      {error && (
        <div className="citizen-alert citizen-alert--error" role="alert">
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <section className="admin-queue-panel" style={{ marginBottom: '16px', padding: '16px 20px' }}>
        <div className="admin-queue-heading" style={{ marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px' }}>Filter Map Complaints</h2>
            <p style={{ margin: '4px 0 0' }}>Plot complaints with recorded coordinates according to status, category or department.</p>
          </div>
          <button
            type="button"
            className={`admin-overdue-toggle${overdueOnly ? ' active' : ''}`}
            onClick={() => setOverdueOnly((val) => !val)}
          >
            <AlertTriangle size={15} />
            {overdueOnly ? 'Showing overdue' : 'Overdue only'}
          </button>
        </div>

        <div className={`admin-filters${isAdmin ? ' admin-filters--with-department' : ''}`} style={{ marginBottom: 0 }}>
          <label className="citizen-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, title, location…"
              aria-label="Search map complaints"
            />
          </label>

          <label>
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((val) => (
                <option key={val}>{val}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((val) => (
                <option key={val}>{val}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((val) => (
                <option key={val}>{val}</option>
              ))}
            </select>
          </label>

          {isAdmin && (
            <label>
              <span>Department</span>
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option>All</option>
                {departments.map((val) => (
                  <option key={val}>{val}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      </section>

      {/* Interactive Map */}
      <div className="admin-map-container">
        <div className="admin-map-overlay-stats">
          <Layers size={15} style={{ color: '#117c6d' }} />
          <span>
            {loading ? 'Updating…' : `${items.length} ${items.length === 1 ? 'complaint' : 'complaints'} on map`}
          </span>
          <button
            type="button"
            onClick={loadMapData}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              color: '#59667c',
              padding: '2px',
            }}
            title="Refresh map data"
            aria-label="Refresh map data"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {!loading && items.length === 0 && (
          <div className="admin-map-empty-overlay">
            <MapPin size={32} style={{ color: '#a0aec0', margin: '0 auto' }} />
            <h3>No complaints plotted</h3>
            <p>
              No geo-tagged complaints match the current filter criteria, or matching complaints do not have map coordinates.
            </p>
          </div>
        )}

        <MapContainer
          center={DEFAULT_MAP_CENTER}
          zoom={DEFAULT_MAP_ZOOM}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} maxZoom={19} />
          <FitBoundsToMarkers items={items} />

          {items.map((complaint) => {
            const coords = complaint.geoLocation?.coordinates;
            if (!Array.isArray(coords) || coords.length !== 2) return null;
            const position = [coords[1], coords[0]];

            return (
              <Marker
                key={complaint._id || complaint.complaintId}
                position={position}
                icon={getComplaintPinIcon(complaint)}
              >
                <Popup className="urbanpulse-popup">
                  <div style={{ minWidth: '220px', maxWidth: '280px' }}>
                    <div className="map-popup-header">
                      <Link
                        to={`/admin/complaints/${complaint.complaintId}`}
                        className="map-popup-id"
                      >
                        {complaint.complaintId}
                      </Link>
                      <StatusBadge status={complaint.status} />
                    </div>

                    <h4 className="map-popup-title">{complaint.title}</h4>

                    <div className="map-popup-row">
                      <MapPin size={13} />
                      <span>{complaint.location}</span>
                    </div>

                    <div className="map-popup-row">
                      <FileText size={13} />
                      <span>{complaint.category} · {complaint.assignedDepartment || 'Unassigned'}</span>
                    </div>

                    <div className="map-popup-row">
                      <CalendarDays size={13} />
                      <span>Submitted: {formatDate(complaint.createdAt)}</span>
                    </div>

                    <div className="map-popup-row">
                      <Clock3 size={13} />
                      <span>Target: {formatDate(complaint.slaDeadline)}</span>
                    </div>

                    <div className="map-popup-meta">
                      <span className="map-popup-badge">
                        Priority: {complaint.priority}
                      </span>
                      {complaint.isOverdue && (
                        <span className="map-popup-badge overdue">
                          Overdue
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/admin/complaints/${complaint.complaintId}`}
                      className="map-popup-action"
                    >
                      Open complaint
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="admin-queue-footer" style={{ marginTop: '12px' }}>
        <span>
          Showing {items.length} complaints with saved coordinates · Click any marker to view details and navigate
        </span>
        <span>
          <MapPin size={13} /> OpenStreetMap data
        </span>
      </div>
    </main>
  );
}
