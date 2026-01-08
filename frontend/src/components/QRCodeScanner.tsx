import React, { useState, useEffect, useRef } from 'react';
import { FriendlyErrorMessage, Toast, SuccessConfirmation } from './PremiumUX';

interface QRCodeScannerProps {
    onScanSuccess: (data: string) => void;
    onClose: () => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
    const [hasCamera, setHasCamera] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [manualInput, setManualInput] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setHasCamera(true);
            }
        } catch (err: any) {
            setError('Camera access denied. Please use manual input below.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualInput.trim()) {
            onScanSuccess(manualInput.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4 w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">📱 QR Code Check-in</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {error ? (
                    <FriendlyErrorMessage
                        error={error}
                        onRetry={startCamera}
                    />
                ) : (
                    <div className="mb-6">
                        {hasCamera ? (
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-white rounded-lg"></div>
                                </div>
                                <p className="text-center text-gray-600 mt-2">Position QR code within the frame</p>
                            </div>
                        ) : (
                            <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <div className="text-6xl mb-4">📷</div>
                                    <p>Camera loading...</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Manual Entry</h3>
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <input
                            type="text"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder="Enter booking number or QR code data"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                disabled={!manualInput.trim()}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Check In
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>💡 Tip: QR codes start with "VU-BOOKING:" or use your reservation number</p>
                </div>
            </div>
        </div>
    );
};

// Hook for QR code scanning functionality
export const useQRCodeScanner = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
        show: false,
        type: 'success',
        message: ''
    });

    const startScanning = () => setIsScanning(true);
    const stopScanning = () => setIsScanning(false);

    const handleScanSuccess = async (data: string) => {
        setResult(data);
        setIsScanning(false);

        try {
            // Process the QR code data
            if (data.startsWith('VU-BOOKING:')) {
                // Parse QR code data
                const parts = data.split(':');
                const reservationNumber = parts[1];

                // Call check-in API
                // This would be implemented in the parent component
                setNotification({
                    show: true,
                    type: 'success',
                    message: `Check-in successful for ${reservationNumber}`
                });
            } else {
                // Treat as reservation number
                setNotification({
                    show: true,
                    type: 'success',
                    message: `Processing check-in for ${data}`
                });
            }
        } catch (error: any) {
            setNotification({
                show: true,
                type: 'error',
                message: 'Check-in failed. Please try again.'
            });
        }
    };

    const clearNotification = () => {
        setNotification({ show: false, type: 'success', message: '' });
    };

    return {
        isScanning,
        result,
        notification,
        startScanning,
        stopScanning,
        handleScanSuccess,
        clearNotification
    };
};

export default QRCodeScanner;