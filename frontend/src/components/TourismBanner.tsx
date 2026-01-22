import React, { useState, useEffect } from 'react';

const tourismMessages = [
    { icon: '🌴', text: 'Welcome to Paradise • Vanuatu', color: 'text-pacific-blue' },
    { icon: '🏝️', text: 'Discover Island Beauty', color: 'text-turquoise' },
    { icon: '🌺', text: 'Experience Pacific Culture', color: 'text-hibiscus' },
    { icon: '🤿', text: 'Dive into Adventure', color: 'text-pacific-deep' },
    { icon: '🌋', text: 'Explore Active Volcanoes', color: 'text-volcanic' },
    { icon: '✨', text: 'Book Your Dream Stay Today', color: 'text-sunset' },
];

export default function TourismBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % tourismMessages.length);
                setIsVisible(true);
            }, 300);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const current = tourismMessages[currentIndex];

    return (
        <div className="bg-gradient-to-r from-volcanic via-earth to-volcanic text-white py-2 overflow-hidden relative border-b-2 border-sunset/30">
            {/* Pacific Pattern Background */}
            <div
                className="absolute inset-0 opacity-40 bg-center bg-repeat"
                style={{
                    backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Cg fill="none" stroke="%23ffffff" stroke-width="3" opacity="1"%3E%3Cpath d="M200,150 Q190,130 200,110 Q210,130 200,150 Q190,170 200,190 Q210,170 200,150" /%3E%3Ccircle cx="200" cy="110" r="15" /%3E%3Ccircle cx="200" cy="190" r="15" /%3E%3Cpath d="M170,150 Q165,140 170,130 L180,135 Q175,145 180,150 Q175,155 180,165 L170,170 Q165,160 170,150" /%3E%3Cpath d="M230,150 Q235,140 230,130 L220,135 Q225,145 220,150 Q225,155 220,165 L230,170 Q235,160 230,150" /%3E%3Cpath d="M150,140 Q145,135 150,125 Q155,130 160,125 Q165,130 170,125" stroke-linecap="round" /%3E%3Cpath d="M250,140 Q255,135 250,125 Q245,130 240,125 Q235,130 230,125" stroke-linecap="round" /%3E%3Cpath d="M150,160 Q145,165 150,175 Q155,170 160,175 Q165,170 170,175" stroke-linecap="round" /%3E%3Cpath d="M250,160 Q255,165 250,175 Q245,170 240,175 Q235,170 230,175" stroke-linecap="round" /%3E%3Ccircle cx="140" cy="150" r="8" /%3E%3Ccircle cx="260" cy="150" r="8" /%3E%3Cpath d="M185,110 Q180,105 185,95 Q190,100 195,95" stroke-linecap="round" /%3E%3Cpath d="M215,110 Q220,105 215,95 Q210,100 205,95" stroke-linecap="round" /%3E%3Cpath d="M185,190 Q180,195 185,205 Q190,200 195,205" stroke-linecap="round" /%3E%3Cpath d="M215,190 Q220,195 215,205 Q210,200 205,205" stroke-linecap="round" /%3E%3C/g%3E%3C/svg%3E')`,
                    backgroundSize: '120px 80px',
                }}
            ></div>

            {/* Animated wave overlay */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-wave-slow"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex items-center justify-center gap-3">
                    {/* Left decoration */}
                    <div className="hidden sm:flex items-center gap-2 animate-pulse-slow">
                        <span className="text-2xl">🌊</span>
                        <div className="pattern-divider-namele w-12 h-0.5 bg-pacific-light/30"></div>
                    </div>

                    {/* Main message with fade animation */}
                    <div
                        className={`flex items-center gap-2 transition-all duration-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                            }`}
                    >
                        <span className="text-3xl animate-bounce-slow">{current.icon}</span>
                        <span className={`font-semibold text-lg ${current.color} drop-shadow-lg tracking-wide`}>
                            {current.text}
                        </span>
                    </div>

                    {/* Right decoration */}
                    <div className="hidden sm:flex items-center gap-2 animate-pulse-slow">
                        <div className="pattern-divider-namele w-12 h-0.5 bg-pacific-light/30"></div>
                        <span className="text-2xl">🌴</span>
                    </div>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-1.5 mt-1">
                    {tourismMessages.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'w-6 bg-sunset'
                                : 'w-1 bg-cloud/40'
                                }`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
