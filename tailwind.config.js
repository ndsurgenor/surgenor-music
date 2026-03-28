/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/templates/**/*.twig',
        './public_html/**/*.php',
        './app/src/**/*.php',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1B6B65',
                    50:  '#e8f4f3',
                    100: '#c5e2e0',
                    200: '#9ecfcb',
                    300: '#77bcb6',
                    400: '#50a9a2',
                    500: '#1B6B65',
                    600: '#165854',
                    700: '#114542',
                    800: '#0c3230',
                    900: '#071f1e',
                },
                accent: {
                    DEFAULT: '#C8A84B',
                    50:  '#faf6e9',
                    100: '#f1e8c3',
                    200: '#e6d89a',
                    300: '#dbc871',
                    400: '#d0b848',
                    500: '#C8A84B',
                    600: '#a8893a',
                    700: '#886b2a',
                    800: '#684e1b',
                    900: '#48310c',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
