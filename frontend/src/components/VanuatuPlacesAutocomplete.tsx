import React, { useRef, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { getAutocompleteOptions } from '../config/maps';

interface VanuatuPlacesAutocompleteProps {
    onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
    placeholder?: string;
    className?: string;
    defaultValue?: string;
}

const VanuatuPlacesAutocomplete: React.FC<VanuatuPlacesAutocompleteProps> = ({
    onPlaceSelected,
    placeholder = 'Search locations in Vanuatu...',
    className = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
    defaultValue = '',
}) => {
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();

            // Validate that the place is in Vanuatu
            if (place.geometry && place.address_components) {
                const country = place.address_components.find(
                    (component: google.maps.GeocoderAddressComponent) => component.types.includes('country')
                );

                if (country?.short_name === 'VU') {
                    onPlaceSelected(place);
                } else {
                    alert('Please select a location within Vanuatu');
                    if (inputRef.current) {
                        inputRef.current.value = '';
                    }
                }
            }
        }
    };

    useEffect(() => {
        if (inputRef.current && defaultValue) {
            inputRef.current.value = defaultValue;
        }
    }, [defaultValue]);

    return (
        <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={getAutocompleteOptions()}
        >
            <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                className={className}
            />
        </Autocomplete>
    );
};

export default VanuatuPlacesAutocomplete;
