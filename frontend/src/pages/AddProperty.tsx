import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function AddProperty() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        propertyType: 'hotel',
        description: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: 'Vanuatu',
            zipCode: '',
            coordinates: {
                lat: -17.7333,
                lng: 168.3167
            }
        },
        amenities: [] as string[],
        images: [] as string[],
        rooms: [{
            type: 'Standard',
            description: '',
            pricePerNight: 0,
            maxGuests: 2,
            amenities: [] as string[],
            available: true
        }]
    });

    const propertyTypes = ['hotel', 'resort', 'villa', 'bungalow', 'guesthouse', 'apartment'];

    const commonAmenities = [
        'WiFi', 'Air Conditioning', 'Swimming Pool', 'Restaurant', 'Bar',
        'Gym', 'Spa', 'Parking', 'Beach Access', 'Room Service',
        'Laundry', 'Airport Shuttle', 'Kitchen', 'TV', 'Coffee Maker',
        'Safe', 'Mini Bar', 'Balcony', 'Ocean View', 'Garden'
    ];

    const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Family Room', 'Oceanview', 'Beachfront'];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                coordinates: {
                    ...prev.address.coordinates,
                    [name]: parseFloat(value) || 0
                }
            }
        }));
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const addRoom = () => {
        setFormData(prev => ({
            ...prev,
            rooms: [...prev.rooms, {
                type: 'Standard',
                description: '',
                pricePerNight: 0,
                maxGuests: 2,
                amenities: [],
                available: true
            }]
        }));
    };

    const updateRoom = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            rooms: prev.rooms.map((room, i) =>
                i === index ? { ...room, [field]: value } : room
            )
        }));
    };

    const removeRoom = (index: number) => {
        if (formData.rooms.length > 1) {
            setFormData(prev => ({
                ...prev,
                rooms: prev.rooms.filter((_, i) => i !== index)
            }));
        }
    };

    const addImageUrl = () => {
        const url = prompt('Enter image URL:');
        if (url) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, url]
            }));
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('/properties', formData);
            navigate('/host/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create property');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-pacific-deep mb-2">Add New Property</h1>
                <p className="text-gray-600">List your hotel, villa, bungalow, or resort on Vanuatu Travel Hub</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="glass-card rounded-pacific p-6">
                    <h2 className="text-2xl font-bold text-pacific-deep mb-4">Basic Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Property Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                                placeholder="e.g., Paradise Beach Resort"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Property Type *</label>
                            <select
                                name="propertyType"
                                value={formData.propertyType}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                                required
                            >
                                {propertyTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                                placeholder="Describe your property, its features, and what makes it special..."
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="glass-card rounded-pacific p-6">
                    <h2 className="text-2xl font-bold text-pacific-deep mb-4">Location</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Street Address *</label>
                            <input
                                type="text"
                                name="address.street"
                                value={formData.address.street}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">City *</label>
                            <input
                                type="text"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                                placeholder="e.g., Port Vila, Luganville"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">State/Province *</label>
                            <input
                                type="text"
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                                placeholder="e.g., Efate, Espiritu Santo"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Zip Code</label>
                            <input
                                type="text"
                                name="address.zipCode"
                                value={formData.address.zipCode}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Latitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                name="lat"
                                value={formData.address.coordinates.lat}
                                onChange={handleCoordinateChange}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                                placeholder="-17.7333"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Longitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                name="lng"
                                value={formData.address.coordinates.lng}
                                onChange={handleCoordinateChange}
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                                placeholder="168.3167"
                            />
                        </div>
                    </div>
                </div>

                {/* Amenities */}
                <div className="glass-card rounded-pacific p-6">
                    <h2 className="text-2xl font-bold text-pacific-deep mb-4">Amenities</h2>
                    <p className="text-gray-600 mb-4">Select all amenities available at your property</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {commonAmenities.map(amenity => (
                            <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.amenities.includes(amenity)}
                                    onChange={() => toggleAmenity(amenity)}
                                    className="w-4 h-4 text-pacific-blue focus:ring-pacific-blue"
                                />
                                <span className="text-sm">{amenity}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Images */}
                <div className="glass-card rounded-pacific p-6">
                    <h2 className="text-2xl font-bold text-pacific-deep mb-4">Property Images</h2>

                    <button
                        type="button"
                        onClick={addImageUrl}
                        className="btn-secondary-tourism mb-4"
                    >
                        + Add Image URL
                    </button>

                    {formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {formData.images.map((url, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={url}
                                        alt={`Property ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rooms */}
                <div className="glass-card rounded-pacific p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-pacific-deep">Rooms & Rates</h2>
                        <button
                            type="button"
                            onClick={addRoom}
                            className="btn-accent"
                        >
                            + Add Room Type
                        </button>
                    </div>

                    <div className="space-y-6">
                        {formData.rooms.map((room, index) => (
                            <div key={index} className="border-2 border-pacific-light/20 rounded-lg p-4 relative">
                                {formData.rooms.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRoom(index)}
                                        className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                                    >
                                        ✕ Remove
                                    </button>
                                )}

                                <h3 className="font-semibold mb-4">Room {index + 1}</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Room Type *</label>
                                        <select
                                            value={room.type}
                                            onChange={(e) => updateRoom(index, 'type', e.target.value)}
                                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                                            required
                                        >
                                            {roomTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Price per Night ($) *</label>
                                        <input
                                            type="number"
                                            value={room.pricePerNight}
                                            onChange={(e) => updateRoom(index, 'pricePerNight', parseFloat(e.target.value))}
                                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Max Guests *</label>
                                        <input
                                            type="number"
                                            value={room.maxGuests}
                                            onChange={(e) => updateRoom(index, 'maxGuests', parseInt(e.target.value))}
                                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                                            min="1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Description</label>
                                        <input
                                            type="text"
                                            value={room.description}
                                            onChange={(e) => updateRoom(index, 'description', e.target.value)}
                                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pacific-blue"
                                            placeholder="Brief room description"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/host/dashboard')}
                        className="btn-secondary-tourism"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary-tourism"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Property'}
                    </button>
                </div>
            </form>
        </div>
    );
}
