import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
        type?: string;
    }>;
    polyline?: Array<[number, number]>;
    className?: string;
    style?: React.CSSProperties;
}

// Create custom icons for different location types
const createCustomIcon = (type: string = 'default') => {
    const typeIcons: Record<string, { emoji: string; color: string }> = {
        'accommodation': { emoji: '🏨', color: '#3B82F6' },
        'attraction': { emoji: '🗾', color: '#10B981' },
        'restaurant': { emoji: '🍽️', color: '#F59E0B' },
        'activity': { emoji: '🎯', color: '#8B5CF6' },
        'transport': { emoji: '✈️', color: '#6B7280' },
        'service': { emoji: '🏢', color: '#EAB308' },
        'default': { emoji: '📍', color: '#3B82F6' }
    };

    const config = typeIcons[type] || typeIcons['default'];

    return L.divIcon({
        html: `
            <div style="
                background: ${config.color}; 
                border: 3px solid white;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                position: relative;
            ">
                <span style="line-height: 1;">${config.emoji}</span>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
        className: 'custom-div-icon'
    });
};

// Component to handle map updates
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom, { animate: true, duration: 1 });
    }, [center, zoom, map]);

    return null;
};

interface MapProps {
    center: [number, number];
    zoom?: number;
    markers?: Array<{
        position: [number, number];
        popup?: string;
    }>;
    polyline?: Array<[number, number]>;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Enhanced Map component for Vanuatu with custom markers and better bounds
 * Includes island-specific styling and comprehensive location support
 */
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
        console.warn('Invalid center coordinates:', center);
        return (
            <div style={style} className={`${className} flex items-center justify-center bg-gray-100 rounded`}>
                <p className="text-gray-500">Map unavailable</p>
            </div>
        );
    }

    const [lat, lng] = center;
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid lat/lng values for center:', { lat, lng });
        return (
            <div style={style} className={`${className} flex items-center justify-center bg-gray-100 rounded`}>
                <p className="text-gray-500">Map unavailable - Invalid coordinates</p>
            </div>
        );
    }

    // Extended Vanuatu bounds to include all islands properly
    const vanuatuBounds: L.LatLngBoundsExpression = [
        [-21.0, 165.5], // Southwest (more inclusive)
        [-12.5, 171.0]  // Northeast (more inclusive)
    ];

    return (
        <div style={style} className={className}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                maxBounds={vanuatuBounds}
                maxBoundsViscosity={0.8}
                minZoom={6}
                maxZoom={18}
                zoomControl={true}
                attributionControl={true}
            >
                <MapUpdater center={center} zoom={zoom} />

                {/* High quality satellite + street hybrid tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={18}
                    tileSize={256}
                />

                {markers
                    .filter(marker => {
                        // Validate marker position
                        if (!marker.position || !Array.isArray(marker.position) || marker.position.length !== 2) {
                            console.warn('Invalid marker position:', marker.position);
                            return false;
                        }
                        const [lat, lng] = marker.position;
                        if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
                            console.warn('Invalid lat/lng values:', { lat, lng });
                            return false;
                        }

                        // Check if marker is within extended Vanuatu bounds
                        const withinBounds = lat >= -21.0 && lat <= -12.5 && lng >= 165.5 && lng <= 171.0;
                        if (!withinBounds) {
                            console.warn('Marker outside Vanuatu bounds:', { lat, lng });
                        }
                        return withinBounds;
                    })
                    .map((marker, index) => (
                        <Marker
                            key={index}
                            position={marker.position}
                            icon={marker.type ? createCustomIcon(marker.type) : DefaultIcon}
                        >
                            {marker.popup && (
                                <Popup
                                    maxWidth={300}
                                    minWidth={200}
                                    className="custom-popup"
                                >
                                    <div
                                        dangerouslySetInnerHTML={{ __html: marker.popup }}
                                        style={{ maxHeight: '400px', overflowY: 'auto' }}
                                    />
                                </Popup>
                            )}
                        </Marker>
                    ))}
            </MapContainer>

            {/* Custom CSS for enhanced popup styling */}
            <style>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .custom-popup .leaflet-popup-tip {
                    background: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .custom-div-icon {
                    background: transparent !important;
                    border: none !important;
                    animation: markerBounce 0.6s ease-out;
                }
                
                @keyframes markerBounce {
                    0% { transform: translateY(-20px) scale(0.8); opacity: 0; }
                    50% { transform: translateY(-10px) scale(1.1); opacity: 0.8; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                
                .leaflet-container {
                    background: #a8d8ea;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
            `}</style>
        </div>
    );
};

export default Map;

