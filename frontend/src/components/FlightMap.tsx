import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom plane icon for departure
const planeIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzNiODJmNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMjEgMTZWMTRMMTMgOVY0LjVDMTMgMy4xMiAxMS44OCAyIDEwLjUgMkM5LjEyIDIgOCAzLjEyIDggNC41VjlMMCAxNFYxNkwyIDEzVjE5QzIgMjAuMSAyLjkgMjEgNCAyMUg3QzguMSAyMSA5IDIwLjEgOSAxOVYxM0wyMSAxNloiLz4KPC9zdmc+',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

// Custom icon for arrival
const arrivalIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYjk4MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTIgMkM4LjEzIDIgNSA1LjEzIDUgOUM1IDEzLjE3IDkuNDIgMTguOTIgMTEuMjQgMjEuMTFDMTEuNjQgMjEuNTkgMTIuMzcgMjEuNTkgMTIuNzcgMjEuMTFDMTQuNTggMTguOTIgMTkgMTMuMTcgMTkgOUMxOSA1LjEzIDE1Ljg3IDIgMTIgMlpNMTIgMTEuNUMxMC42MiAxMS41IDkuNSAxMC4zOCA5LjUgOUM5LjUgNy42MiAxMC42MiA2LjUgMTIgNi41QzEzLjM4IDYuNSAxNC41IDcuNjIgMTQuNSA5QzE0LjUgMTAuMzggMTMuMzggMTEuNSAxMiAxMS41WiIvPgo8L3N2Zz4=',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

interface FlightMapProps {
    departureCoords: [number, number];
    arrivalCoords: [number, number];
    departureAirport: string;
    arrivalAirport: string;
    className?: string;
}

const FlightMap: React.FC<FlightMapProps> = ({
    departureCoords,
    arrivalCoords,
    departureAirport,
    arrivalAirport,
    className = ''
}) => {
    // Calculate center point between departure and arrival
    const centerLat = (departureCoords[0] + arrivalCoords[0]) / 2;
    const centerLng = (departureCoords[1] + arrivalCoords[1]) / 2;

    // Calculate zoom level based on distance
    const latDiff = Math.abs(departureCoords[0] - arrivalCoords[0]);
    const lngDiff = Math.abs(departureCoords[1] - arrivalCoords[1]);
    const maxDiff = Math.max(latDiff, lngDiff);
    const zoom = maxDiff > 50 ? 3 : maxDiff > 20 ? 4 : maxDiff > 10 ? 5 : 6;

    // Create curved path for flight route
    const createCurvedPath = () => {
        const steps = 50;
        const path: [number, number][] = [];

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const lat = departureCoords[0] + (arrivalCoords[0] - departureCoords[0]) * t;
            const lng = departureCoords[1] + (arrivalCoords[1] - arrivalCoords[1]) * t;

            // Add curve (parabolic arc)
            const curvature = 0.2;
            const curveHeight = Math.sin(t * Math.PI) * maxDiff * curvature;
            const curvedLat = lat + curveHeight;

            path.push([curvedLat, lng]);
        }

        return path;
    };

    return (
        <MapContainer
            center={[centerLat, centerLng]}
            zoom={zoom}
            className={className}
            style={{ height: '300px', width: '100%', borderRadius: '8px' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Departure marker */}
            <Marker position={departureCoords} icon={planeIcon}>
                <Popup>
                    <strong>Departure</strong><br />
                    {departureAirport}
                </Popup>
            </Marker>

            {/* Arrival marker */}
            <Marker position={arrivalCoords} icon={arrivalIcon}>
                <Popup>
                    <strong>Arrival</strong><br />
                    {arrivalAirport}
                </Popup>
            </Marker>

            {/* Flight path */}
            <Polyline
                positions={createCurvedPath()}
                color="#3b82f6"
                weight={3}
                opacity={0.7}
                dashArray="10, 10"
            />
        </MapContainer>
    );
};

export default FlightMap;
