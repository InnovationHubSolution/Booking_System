import React from 'react';
import { LoadScript } from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES } from '../config/maps';

interface GoogleMapsProviderProps {
    children: React.ReactNode;
}

const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error('Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to .env file');
        return (
            <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
                <p className="text-yellow-800">
                    ⚠️ Google Maps API key is not configured. Please contact support.
                </p>
            </div>
        );
    }

    return (
        <LoadScript
            googleMapsApiKey={apiKey}
            libraries={GOOGLE_MAPS_LIBRARIES}
            loadingElement={
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Loading maps...</span>
                </div>
            }
        >
            {children}
        </LoadScript>
    );
};

export default GoogleMapsProvider;
