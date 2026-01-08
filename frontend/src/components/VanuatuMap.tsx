import React from 'react';
import { GoogleMap, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { getMapOptions } from '../config/maps';

interface MapMarker {
    position: { lat: number; lng: number };
    title?: string;
    info?: string;
    icon?: string;
}

interface VanuatuMapProps {
    center?: { lat: number; lng: number };
    zoom?: number;
    markers?: MapMarker[];
    polyline?: { lat: number; lng: number }[];
    className?: string;
    style?: React.CSSProperties;
    onMapClick?: (e: google.maps.MapMouseEvent) => void;
}

const VanuatuMap: React.FC<VanuatuMapProps> = ({
    center,
    zoom,
    markers = [],
    polyline,
    className = '',
    style = { height: '400px', width: '100%' },
    onMapClick,
}) => {
    const [selectedMarker, setSelectedMarker] = React.useState<number | null>(null);
    const mapOptions = getMapOptions();

    // Override center and zoom if provided
    if (center) {
        mapOptions.center = center;
    }
    if (zoom !== undefined) {
        mapOptions.zoom = zoom;
    }

    return (
        <GoogleMap
            mapContainerStyle={style}
            mapContainerClassName={className}
            options={mapOptions}
            onClick={onMapClick}
        >
            {/* Render markers */}
            {markers.map((marker, index) => (
                <Marker
                    key={index}
                    position={marker.position}
                    title={marker.title}
                    icon={marker.icon}
                    onClick={() => setSelectedMarker(index)}
                />
            ))}

            {/* Render info windows */}
            {markers.map((marker, index) => (
                selectedMarker === index && marker.info && (
                    <InfoWindow
                        key={`info-${index}`}
                        position={marker.position}
                        onCloseClick={() => setSelectedMarker(null)}
                    >
                        <div dangerouslySetInnerHTML={{ __html: marker.info }} />
                    </InfoWindow>
                )
            ))}

            {/* Render polyline if provided */}
            {polyline && polyline.length > 0 && (
                <Polyline
                    path={polyline}
                    options={{
                        strokeColor: '#3b82f6',
                        strokeOpacity: 0.8,
                        strokeWeight: 3,
                    }}
                />
            )}
        </GoogleMap>
    );
};

export default VanuatuMap;
