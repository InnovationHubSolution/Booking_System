import React from 'react';

interface LoadingScreenProps {
    message?: string;
    fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = 'Loading your adventure...',
    fullScreen = true
}) => {
    return (
        <div className={`${fullScreen ? 'fixed inset-0' : 'relative min-h-screen'} flex items-center justify-center bg-gradient-to-br from-pacific-deep via-pacific-blue to-pacific-turquoise z-50`}>
            {/* Pattern overlays */}
            <div className="absolute inset-0 pattern-kastom-mat opacity-10 pointer-events-none"></div>
            <div className="absolute inset-0 pattern-reef opacity-5 pointer-events-none"></div>

            {/* Animated wave decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent animate-wave-slow"></div>
            </div>

            <div className="relative z-10 text-center px-4">
                {/* Logo/Icon */}
                <div className="mb-8 animate-float">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-lg shadow-2xl">
                        <span className="text-6xl">🌴</span>
                    </div>
                </div>

                {/* Spinner */}
                <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-t-sunset rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                </div>

                {/* Text */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 hero-slide-up">
                    Vanuatu Travel Hub
                </h2>
                <p className="text-lg text-cloud-gray animate-pulse hero-slide-up-delay-1">
                    {message}
                </p>

                {/* Dots loader */}
                <div className="flex justify-center items-center gap-2 mt-6 hero-slide-up-delay-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
