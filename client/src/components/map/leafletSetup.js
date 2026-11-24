import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Ensure standard Leaflet default icons resolve properly in Vite dev and prod
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// Default center on New Delhi / India for standard civic view
export const DEFAULT_MAP_CENTER = [28.6139, 77.209];
export const DEFAULT_MAP_ZOOM = 12;

/**
 * Creates an SVG DivIcon with custom colors and anchor points.
 */
export function createPinIcon({ color = '#117c6d', dotColor = '#ffffff', pulse = false } = {}) {
  const pulseHtml = pulse
    ? '<span class="map-pin-pulse"></span>'
    : '';

  const html = `
    <div class="map-pin-wrapper">
      ${pulseHtml}
      <svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg" class="map-pin-svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24c0-7.732-6.268-14-14-14z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="14" cy="14" r="5" fill="${dotColor}"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'urbanpulse-map-pin',
    html,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -36],
  });
}

/**
 * Returns an icon color based on complaint status and overdue flag.
 */
export function getComplaintPinIcon(complaint) {
  if (complaint.isOverdue) {
    return createPinIcon({ color: '#c45b50', dotColor: '#ffffff' }); // Red for overdue
  }
  switch (complaint.status) {
    case 'Submitted':
      return createPinIcon({ color: '#d78a27', dotColor: '#ffffff' }); // Orange
    case 'Assigned':
      return createPinIcon({ color: '#4779dc', dotColor: '#ffffff' }); // Blue
    case 'In Progress':
      return createPinIcon({ color: '#8660cf', dotColor: '#ffffff' }); // Purple
    case 'Resolved':
      return createPinIcon({ color: '#2e8b57', dotColor: '#ffffff' }); // Green
    case 'Rejected':
      return createPinIcon({ color: '#748096', dotColor: '#ffffff' }); // Slate
    default:
      return createPinIcon({ color: '#117c6d', dotColor: '#ffffff' }); // Forest green
  }
}
