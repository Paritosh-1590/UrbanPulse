import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, X, Info } from 'lucide-react';
import {
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  createPinIcon,
} from './leafletSetup.js';
import './map.css';

function normalizeCoords(value) {
  if (!value) return null;
  if (Array.isArray(value) && value.length === 2) {
    const lng = Number(value[0]);
    const lat = Number(value[1]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
  }
  if (value && typeof value === 'object' && Array.isArray(value.coordinates)) {
    const lng = Number(value.coordinates[0]);
    const lat = Number(value.coordinates[1]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
  }
  return null;
}

function LocationMarker({ coordinates, onChange }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      // Precision to 6 decimal places (~0.1m)
      onChange([Number(lng.toFixed(6)), Number(lat.toFixed(6))]);
    },
  });

  if (!coordinates) return null;

  // Leaflet expects [latitude, longitude], GeoJSON uses [longitude, latitude]
  const position = [coordinates[1], coordinates[0]];

  return (
    <Marker
      position={position}
      draggable={true}
      icon={createPinIcon({ color: '#117c6d', dotColor: '#baf6c0', pulse: true })}
      eventHandlers={{
        dragend(event) {
          const marker = event.target;
          const pos = marker.getLatLng();
          onChange([Number(pos.lng.toFixed(6)), Number(pos.lat.toFixed(6))]);
        },
      }}
    >
      <Popup>
        <div style={{ textAlign: 'center', padding: '4px' }}>
          <strong style={{ display: 'block', color: '#117c6d', marginBottom: '4px' }}>
            Selected Location
          </strong>
          <span style={{ fontSize: '11px', color: '#24334a', display: 'block' }}>
            Lat: {coordinates[1].toFixed(5)}, Lng: {coordinates[0].toFixed(5)}
          </span>
          <span style={{ fontSize: '10px', color: '#748096', marginTop: '4px', display: 'block' }}>
            (Drag to fine-tune position)
          </span>
        </div>
      </Popup>
    </Marker>
  );
}

function MapViewController({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates) {
      map.panTo([coordinates[1], coordinates[0]], { animate: true });
    }
  }, [coordinates, map]);
  return null;
}

export default function ComplaintLocationPicker({
  value = null,
  onChange,
  height = '300px',
  label = 'Pin location on map (optional)',
}) {
  const coordinates = normalizeCoords(value);

  const initialCenter = coordinates
    ? [coordinates[1], coordinates[0]]
    : DEFAULT_MAP_CENTER;

  return (
    <div className="map-picker-component">
      <div className="map-picker-toolbar">
        <div className={`map-picker-status ${coordinates ? 'is-selected' : ''}`}>
          <MapPin size={15} />
          <span>{label}</span>
          {coordinates ? (
            <span className="map-picker-coords">
              {coordinates[1] >= 0 ? `${coordinates[1].toFixed(5)}°N` : `${Math.abs(coordinates[1]).toFixed(5)}°S`},{' '}
              {coordinates[0] >= 0 ? `${coordinates[0].toFixed(5)}°E` : `${Math.abs(coordinates[0]).toFixed(5)}°W`}
            </span>
          ) : (
            <span style={{ color: '#748096', fontSize: '11px' }}>
              (Click on map to place pin)
            </span>
          )}
        </div>

        {coordinates && (
          <button
            type="button"
            className="map-picker-clear-btn"
            onClick={() => onChange(null)}
            aria-label="Clear selected map coordinates"
          >
            <X size={13} />
            <span>Clear map selection</span>
          </button>
        )}
      </div>

      <div className="map-wrapper" style={{ height }}>
        <MapContainer
          center={initialCenter}
          zoom={DEFAULT_MAP_ZOOM}
          scrollWheelZoom={false}
          className="map-container"
        >
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} maxZoom={19} />
          <LocationMarker coordinates={coordinates} onChange={onChange} />
          <MapViewController coordinates={coordinates} />
        </MapContainer>
      </div>

      <div className="map-picker-hint">
        <Info size={13} />
        <span>
          Clicking the map sets geographic coordinates that supplement your typed address. Drag the pin to adjust.
        </span>
      </div>
    </div>
  );
}
