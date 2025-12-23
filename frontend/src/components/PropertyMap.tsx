import React from 'react';
import Map from './Map';

interface PropertyMapProps {
    coordinates: [number, number]; // [longitude, latitude]
    propertyName: string;
    price?: number;
    rating?: number;
    imageUrl?: string;
    style?: React.CSSProperties;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
    coordinates,
    propertyName,
    price,
    rating,
    imageUrl,
    style,
}) => {
    // Leaflet uses [lat, lng] format, but backend stores [lng, lat]
    const mapCenter: [number, number] = [coordinates[1], coordinates[0]];

    const markers = [
        {
            id: '1',
            position: mapCenter,
            title: propertyName,
            type: 'property' as const,
            price,
            rating,
            imageUrl,
        },
    ];

    return (
        <div className="rounded-lg overflow-hidden">
            <Map
                center={mapCenter}
                zoom={15}
                markers={markers}
                style={style || { height: '400px', width: '100%' }}
            />
        </div>
    );
};

export default PropertyMap;
