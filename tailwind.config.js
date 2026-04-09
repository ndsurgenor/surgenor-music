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
                cream:    '#FAF8F5',
                charcoal: '#2C2C2C',
                navy: {
                    DEFAULT: '#0D1B2A',
                    400: '#1E3A5F',
                    500: '#162d4a',
                    600: '#0D1B2A',
                },
                primary: {
                    DEFAULT: '#147972',
                    50:  '#e6f3f2',
                    100: '#b9dedd',
                    200: '#8bc9c7',
                    300: '#5db4b1',
                    400: '#2f9f9b',
                    500: '#147972',
                    600: '#10615b',
                    700: '#0c4944',
                    800: '#08312e',
                    900: '#041917',
                },
                accent: {
                    DEFAULT: '#DEB019',
                    50:  '#fdf8e3',
                    100: '#f9ecb3',
                    200: '#f4df80',
                    300: '#efd24d',
                    400: '#eac52a',
                    500: '#DEB019',
                    600: '#b28e14',
                    700: '#866b0f',
                    800: '#5a480a',
                    900: '#2e2505',
                },
            },
            screens: {
                'th': '375px',
            },
            fontFamily: {
                sans:      ['Inter', 'system-ui', 'sans-serif'],
                secondary: ['Plaster', 'cursive'],
                hero:      ['Questrial', 'system-ui', 'sans-serif'],
            },
        },
    },
    safelist: [
        'animate-spin',
        'rotate-90',
    ],
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
