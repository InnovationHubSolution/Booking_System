import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    center: [number, number];
    zoom?: number;
    markers?: Array<{
        position: [number, number];
        popup?: string;
        icon?: L.Icon;
    }>;
    polyline?: Array<[number, number]>;
    className?: string;
    style?: React.CSSProperties;
}

const Map: React.FC<MapProps> = ({
    center,
    zoom = 13,
    markers = [],
    polyline,
    className = '',
    style = { height: '400px', width: '100%' }
}) => {
    // Validate coordinates
    if (!center || !Array.isArray(center) || center.length !== 2) {
        return <div style={style} className={`${className} flex items-center justify-center bg-gray-100 rounded`}>
            <p className="text-gray-500">Map unavailable</p>
        </div>;
    }

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            className={className}
            style={style}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {markers.map((marker, index) => (
                <Marker
                    key={index}
                    position={marker.position}
                    icon={marker.icon}
                >
                    {marker.popup && <Popup>{marker.popup}</Popup>}
                </Marker>
            ))}

            {polyline && (
                <Polyline
                    positions={polyline}
                    color="#3b82f6"
                    weight={3}
                    opacity={0.7}
                />
            )}
        </MapContainer>
    );
};

export default Map;
