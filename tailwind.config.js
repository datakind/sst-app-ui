import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './vendor/laravel/jetstream/**/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            screens: {
                'sm': '576px',
                // => @media (min-width: 576px) { ... }

                'md': '1152px',
                // => @media (min-width: 960px) { ... }

                'lg': '1440px',
                // => @media (min-width: 1440px) { ... }
            },
            colors: {
                primary: {
                    DEFAULT: '#f79122',
                    dark: '#e37425',
                    light: '#f9aa62',
                },
                secondary: {
                    DEFAULT: '#385981',
                    dark: '#2f3c5b',
                    light: '#87b7cc',
                },
                link: {
                    DEFAULT: '#3596cd',
                },
                gray: {
                    DEFAULT: '#303030',
                    dark: '#606060',
                    light: '#959595',
                },
                green: {
                    DEFAULT: '#25A95A',
                },
                red: {
                    DEFAULT: '#A92532',
                },
                background: {
                    DEFAULT: '#f1f1f1',
                    light: '#ffffff',
                },
            },
        },
    },

    plugins: [forms, typography],
};
