import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuthStore } from '../store/authStore';
import Map from '../components/Map';
import { useCurrencyStore } from '../store/currencyStore';
import CurrencySelector from '../components/CurrencySelector';

interface Property {
    _id: string;
    name: string;
    description: string;
    propertyType: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        coordinates: { lat: number; lng: number };
    };
    images: string[];
    amenities: string[];
    rooms: Array<{
        type: string;
        description: string;
        maxGuests: number;
        beds: number;
        bathrooms: number;
        pricePerNight: number;
        amenities: string[];
    }>;
    rating: number;
    reviewCount: number;
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    houseRules: string[];
    ownerId: {
        firstName: string;
        lastName: string;
    };
}

interface Review {
    _id: string;
    userId: {
        firstName: string;
        lastName: string;
    };
    rating: number;
    cleanliness: number;
    accuracy: number;
    checkIn: number;
    communication: number;
    location: number;
    value: number;
    comment: string;
    createdAt: string;
    helpful: string[];
}

export default function PropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const { formatPrice } = useCurrencyStore();
    const [property, setProperty] = useState<Property | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewStats, setReviewStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedRoom, setSelectedRoom] = useState<string>('');
    const [bookingDates, setBookingDates] = useState({
        checkIn: '',
        checkOut: '',
        adults: 2,
        children: 0
    });
    const [inWishlist, setInWishlist] = useState(false);
    const [showAllAmenities, setShowAllAmenities] = useState(false);

    useEffect(() => {
        fetchProperty();
        fetchReviews();
        if (token) checkWishlist();
    }, [id]);

    const fetchProperty = async () => {
        try {
            const response = await axios.get(`/properties/${id}`);
            setProperty(response.data);
            if (response.data.rooms.length > 0) {
                setSelectedRoom(response.data.rooms[0].type);
            }
        } catch (error) {
            console.error('Error fetching property:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/reviews/property/${id}`);
            setReviews(response.data.reviews);
            setReviewStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const checkWishlist = async () => {
        try {
            const response = await axios.get(`/wishlist/check/${id}`);
            setInWishlist(response.data.inWishlist);
        } catch (error) {
            console.error('Error checking wishlist:', error);
        }
    };

    const toggleWishlist = async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            if (inWishlist) {
                await axios.delete(`/wishlist/remove/${id}`);
            } else {
                await axios.post(`/wishlist/add/${id}`);
            }
            setInWishlist(!inWishlist);
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    const calculateNights = () => {
        if (!bookingDates.checkIn || !bookingDates.checkOut) return 0;
        const checkIn = new Date(bookingDates.checkIn);
        const checkOut = new Date(bookingDates.checkOut);
        return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    };

    const handleBooking = () => {
        if (!token) {
            navigate('/login');
            return;
        }

        if (!bookingDates.checkIn || !bookingDates.checkOut || !selectedRoom) {
            alert('Please select dates and room type');
            return;
        }

        navigate('/booking/property', {
            state: {
                propertyId: id,
                roomType: selectedRoom,
                ...bookingDates
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vanuatu-blue"></div>
            </div>
        );
    }

    if (!property) {
        return <div className="container mx-auto px-4 py-20 text-center">Property not found</div>;
    }

    const selectedRoomData = property.rooms.find(r => r.type === selectedRoom);
    const nights = calculateNights();
    const totalPrice = selectedRoomData ? selectedRoomData.pricePerNight * nights : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Image Gallery */}
            <div className="container mx-auto px-4 py-6">
                <div className="absolute top-20 right-8 z-10">
                    <CurrencySelector />
                </div>
                <div className="grid grid-cols-4 gap-2 h-[500px]">
                    <div className="col-span-3 row-span-2">
                        <img
                            src={property.images[selectedImage] || 'https://via.placeholder.com/800'}
                            alt={property.name}
                            className="w-full h-full object-cover rounded-l-lg"
                        />
                    </div>
                    {property.images.slice(1, 5).map((img, idx) => (
                        <div key={idx} className="cursor-pointer" onClick={() => setSelectedImage(idx + 1)}>
                            <img src={img} alt="" className="w-full h-full object-cover hover:opacity-75 transition" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Header */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
                                    <p className="text-gray-600">
                                        {property.address.street}, {property.address.city}, {property.address.state}
                                    </p>
                                </div>
                                <button
                                    onClick={toggleWishlist}
                                    className={`p-3 rounded-full ${inWishlist ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                                >
                                    {inWishlist ? '❤️' : '🤍'}
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center">
                                    <span className="text-vanuatu-yellow text-xl mr-1">★</span>
                                    <span className="font-bold text-lg">{property.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-gray-600">
                                    {property.reviewCount} reviews
                                </span>
                                <span className="px-3 py-1 bg-vanuatu-blue text-white rounded-full text-sm">
                                    {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                                </span>
                            </div>

                            <p className="text-gray-700 leading-relaxed">{property.description}</p>
                        </div>

                        {/* Room Selection */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>
                            <div className="space-y-4">
                                {property.rooms.map((room, idx) => (
                                    <div
                                        key={idx}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition ${selectedRoom === room.type
                                            ? 'border-vanuatu-blue bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                        onClick={() => setSelectedRoom(room.type)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg mb-2">{room.type}</h3>
                                                <p className="text-gray-600 mb-3">{room.description}</p>
                                                <div className="flex gap-4 text-sm text-gray-600 mb-2">
                                                    <span>👥 {room.maxGuests} guests</span>
                                                    <span>🛏️ {room.beds} bed(s)</span>
                                                    <span>🚿 {room.bathrooms} bathroom(s)</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {room.amenities.map((amenity, i) => (
                                                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="text-2xl font-bold text-vanuatu-blue">
                                                    {formatPrice(room.pricePerNight, false)}
                                                </div>
                                                <div className="text-sm text-gray-600">per night</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {(showAllAmenities ? property.amenities : property.amenities.slice(0, 10)).map((amenity, idx) => (
                                    <div key={idx} className="flex items-center">
                                        <span className="mr-2">✓</span>
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                            {property.amenities.length > 10 && (
                                <button
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    className="mt-4 text-vanuatu-blue font-semibold"
                                >
                                    {showAllAmenities ? 'Show Less' : `Show All ${property.amenities.length} Amenities`}
                                </button>
                            )}
                        </div>

                        {/* Location Map */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-2xl font-bold mb-4">Location</h2>
                            <p className="text-gray-600 mb-4">
                                {property.address.street}, {property.address.city}, {property.address.state}, {property.address.country}
                            </p>
                            <Map
                                center={[property.address.coordinates.lat, property.address.coordinates.lng]}
                                zoom={15}
                                markers={[{
                                    position: [property.address.coordinates.lat, property.address.coordinates.lng],
                                    popup: property.name
                                }]}
                                style={{ height: '350px', width: '100%', borderRadius: '8px' }}
                            />
                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6">Guest Reviews</h2>

                            {reviewStats && (
                                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <div className="text-sm text-gray-600">Cleanliness</div>
                                            <div className="font-bold">{reviewStats.avgCleanliness?.toFixed(1)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Accuracy</div>
                                            <div className="font-bold">{reviewStats.avgAccuracy?.toFixed(1)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Check-in</div>
                                            <div className="font-bold">{reviewStats.avgCheckIn?.toFixed(1)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Communication</div>
                                            <div className="font-bold">{reviewStats.avgCommunication?.toFixed(1)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Location</div>
                                            <div className="font-bold">{reviewStats.avgLocation?.toFixed(1)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Value</div>
                                            <div className="font-bold">{reviewStats.avgValue?.toFixed(1)}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {reviews.slice(0, 5).map((review) => (
                                    <div key={review._id} className="border-b pb-6">
                                        <div className="flex items-center mb-2">
                                            <div className="w-10 h-10 rounded-full bg-vanuatu-blue text-white flex items-center justify-center mr-3">
                                                {review.userId.firstName[0]}
                                            </div>
                                            <div>
                                                <div className="font-semibold">
                                                    {review.userId.firstName} {review.userId.lastName}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="ml-auto flex items-center">
                                                <span className="text-vanuatu-yellow mr-1">★</span>
                                                <span className="font-bold">{review.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <div className="text-2xl font-bold mb-4">
                                {formatPrice(selectedRoomData?.pricePerNight || 0, false)}
                                <span className="text-base text-gray-600 font-normal"> /night</span>
                            </div>

                            <div className="space-y-4 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Check-in</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={bookingDates.checkIn}
                                        onChange={(e) => setBookingDates({ ...bookingDates, checkIn: e.target.value })}
                                    />
                                    <div className="text-xs text-gray-600 mt-1">After {property.checkInTime}</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Check-out</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={bookingDates.checkOut}
                                        onChange={(e) => setBookingDates({ ...bookingDates, checkOut: e.target.value })}
                                    />
                                    <div className="text-xs text-gray-600 mt-1">Before {property.checkOutTime}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Adults</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full px-4 py-2 border rounded-lg"
                                            value={bookingDates.adults}
                                            onChange={(e) => setBookingDates({ ...bookingDates, adults: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Children</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-4 py-2 border rounded-lg"
                                            value={bookingDates.children}
                                            onChange={(e) => setBookingDates({ ...bookingDates, children: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {nights > 0 && (
                                <div className="mb-4 p-3 bg-gray-50 rounded">
                                    <div className="flex justify-between mb-1">
                                        <span>{formatPrice(selectedRoomData?.pricePerNight || 0, false)} × {nights} nights</span>
                                        <span>{formatPrice(totalPrice, false)}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleBooking}
                                className="w-full bg-vanuatu-blue hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                            >
                                Reserve
                            </button>

                            <div className="mt-4 text-center text-sm text-gray-600">
                                You won't be charged yet
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <div className="font-semibold mb-2">Cancellation Policy</div>
                                <div className="text-sm text-gray-600">
                                    {property.cancellationPolicy === 'flexible' &&
                                        'Free cancellation up to 24 hours before check-in'}
                                    {property.cancellationPolicy === 'moderate' &&
                                        'Free cancellation up to 5 days before check-in'}
                                    {property.cancellationPolicy === 'strict' &&
                                        'Free cancellation up to 14 days before check-in'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
