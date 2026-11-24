import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, MapPinOff, ExternalLink } from 'lucide-react';
import {
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  createPinIcon,
} from './leafletSetup.js';
import './map.css';

function extractCoords(geoLocation) {
  if (!geoLocation) return null;
  if (Array.isArray(geoLocation.coordinates) && geoLocation.coordinates.length === 2) {
    const lng = Number(geoLocation.coordinates[0]);
    const lat = Number(geoLocation.coordinates[1]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      return [lng, lat];
    }
  }
  return null;
}

export default function ComplaintLocationMap({
  geoLocation = null,
  location = '',
  title = '',
  height = '260px',
}) {
  const coords = extractCoords(geoLocation);

  if (!coords) {
    return (
      <div className="map-fallback-card" role="region" aria-label="Geographic location">
        <div className="map-fallback-icon">
          <MapPinOff size={20} />
        </div>
        <div className="map-fallback-content">
          <h4>No map coordinates provided</h4>
          <p>
            This complaint was submitted with a text location only:{' '}
            <strong>{location || 'Location details not recorded'}</strong>.
          </p>
        </div>
      </div>
    );
  }

  // Leaflet expects [latitude, longitude]
  const position = [coords[1], coords[0]];
  const osmUrl = `https://www.openstreetmap.org/?mlat=${coords[1]}&mlon=${coords[0]}#map=16/${coords[1]}/${coords[0]}`;

  return (
    <section className="complaint-detail-map-section" aria-label="Complaint Map Location">
      <div className="citizen-form-card__heading" style={{ marginBottom: '8px' }}>
        <h3>Geographic Location</h3>
        <p>Pinned location on OpenStreetMap</p>
      </div>

      <div className="map-wrapper" style={{ height }}>
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          className="map-container"
        >
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} maxZoom={19} />
          <Marker
            position={position}
            icon={createPinIcon({ color: '#117c6d', dotColor: '#baf6c0' })}
          >
            <Popup>
              <div style={{ padding: '4px' }}>
                {title && (
                  <strong style={{ display: 'block', marginBottom: '4px', color: '#172033' }}>
                    {title}
                  </strong>
                )}
                <div style={{ fontSize: '11px', color: '#59667c', marginBottom: '4px' }}>
                  <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {location || 'Reported Location'}
                </div>
                <div style={{ fontSize: '10px', color: '#748096', fontFamily: 'monospace' }}>
                  Lat: {coords[1].toFixed(5)}, Lng: {coords[0].toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="complaint-map-meta">
        <span>
          Coordinates:{' '}
          <strong>
            {coords[1] >= 0 ? `${coords[1].toFixed(5)}°N` : `${Math.abs(coords[1]).toFixed(5)}°S`},{' '}
            {coords[0] >= 0 ? `${coords[0].toFixed(5)}°E` : `${Math.abs(coords[0]).toFixed(5)}°W`}
          </strong>
        </span>
        <a href={osmUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span>View on OpenStreetMap</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </section>
  );
}
