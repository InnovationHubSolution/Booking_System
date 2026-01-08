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

    // Create popup content with property details
    const popupContent = `
        <div class="text-center">
            <h3 class="font-bold text-lg">${propertyName}</h3>
            ${price ? `<p class="text-blue-600 font-semibold">$${price}/night</p>` : ''}
            ${rating ? `<p class="text-yellow-500">★ ${rating.toFixed(1)}</p>` : ''}
        </div>
    `;

    const markers = [
        {
            position: mapCenter,
            popup: popupContent,
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
