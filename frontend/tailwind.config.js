export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Legacy Vanuatu flag colors (kept for compatibility)
                'vanuatu-blue': '#004D7A',
                'vanuatu-green': '#009E60',
                'vanuatu-yellow': '#FFCE00',

                // Pacific Design System - Ocean & Sky
                'pacific': {
                    'deep': '#0A4A6B',
                    'blue': '#1B7FA8',
                    'light': '#4FA8CE',
                    'turquoise': '#00A99D',
                    'sky': '#87CEEB',
                },

                // Earth Tones - Land & Growth
                'volcanic': {
                    'black': '#2C2C2C',
                    'ash': '#4A4A4A',
                },
                'earth': {
                    'brown': '#6B4423',
                    'sand': '#D4B896',
                },
                'pandanus': {
                    DEFAULT: '#B8956A',
                    'light': '#C9A57B',
                    'dark': '#9E7F54',
                },
                'bamboo': {
                    DEFAULT: '#8B9E7D',
                    'light': '#A4B598',
                    'dark': '#6F8163',
                },

                // Accent Colors - Fire & Sunset
                'coral': {
                    DEFAULT: '#FF6B4A',
                    'light': '#FF8C6F',
                    'dark': '#E54F2E',
                },
                'sunset': {
                    DEFAULT: '#F4A842',
                    'light': '#F7BE6B',
                    'dark': '#D98E28',
                },
                'flame': {
                    DEFAULT: '#D64545',
                    'light': '#E26767',
                    'dark': '#B92F2F',
                },
                'hibiscus': {
                    DEFAULT: '#E85D75',
                    'light': '#EF7F93',
                    'dark': '#D73E5A',
                },

                // Neutral Tones - Clouds & Mist
                'cloud': {
                    DEFAULT: '#FAFAFA',
                    'gray': '#F5F5F5',
                },
                'mist': {
                    DEFAULT: '#E5E5E5',
                    'light': '#EEEEEE',
                },
                'stone': {
                    DEFAULT: '#9E9E9E',
                    'light': '#BDBDBD',
                    'dark': '#757575',
                },
                'shadow': {
                    DEFAULT: '#616161',
                    'light': '#757575',
                    'dark': '#424242',
                },
            },

            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                heading: ['Montserrat', 'Inter', 'sans-serif'],
            },

            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '26': '6.5rem',
                '30': '7.5rem',
            },

            opacity: {
                '3': '0.03',
            },

            borderRadius: {
                'pacific': '0.75rem',
                'wave': '1rem 1rem 0.5rem 0.5rem',
            },

            boxShadow: {
                'pacific': '0 4px 6px -1px rgba(10, 74, 107, 0.1), 0 2px 4px -1px rgba(10, 74, 107, 0.06)',
                'pacific-lg': '0 10px 15px -3px rgba(10, 74, 107, 0.1), 0 4px 6px -2px rgba(10, 74, 107, 0.05)',
                'coral': '0 4px 14px 0 rgba(255, 107, 74, 0.25)',
                'sunset': '0 4px 14px 0 rgba(244, 168, 66, 0.25)',
            },

            backgroundImage: {
                'gradient-ocean': 'linear-gradient(135deg, #1B7FA8 0%, #00A99D 100%)',
                'gradient-sunset': 'linear-gradient(135deg, #F4A842 0%, #FF6B4A 100%)',
                'gradient-earth': 'linear-gradient(135deg, #6B4423 0%, #8B9E7D 100%)',
                'gradient-volcanic': 'linear-gradient(180deg, #2C2C2C 0%, #4A4A4A 100%)',
            },

            animation: {
                'wave': 'wave 3s ease-in-out infinite',
                'ripple': 'ripple 2s ease-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },

            keyframes: {
                wave: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '50%': { transform: 'translateX(10px)' },
                },
                ripple: {
                    '0%': { transform: 'scale(0.8)', opacity: '1' },
                    '100%': { transform: 'scale(2.4)', opacity: '0' },
                },
            },
        },
    },
    plugins: [],
}
