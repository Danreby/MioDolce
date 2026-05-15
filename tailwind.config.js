/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.jsx',
    ],
    theme: {
        extend: {
            colors: {
                cream: {
                    DEFAULT: '#e6ddcf',
                    50:  '#f7f4ef',
                    100: '#e6ddcf',
                    200: '#d4c5ae',
                },
                brown: {
                    DEFAULT: '#583c29',
                    50:  '#f5f0eb',
                    100: '#d4bfaa',
                    200: '#af987e',
                    300: '#947c5e',
                    400: '#84756d',
                    500: '#6b5547',
                    600: '#583c29',
                    700: '#4a3221',
                    800: '#3c2819',
                    900: '#2e1e12',
                },
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.25s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%':   { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%':   { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};
