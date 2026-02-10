import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1827a0',
        primaryDark: '#03034b',
        primaryLight: '#0c5ee5',
        background: '#e8e4d5',
        accent: '#f9f2f7',
        // Optionally override gray/blue for more consistent theme
        blue: {
          600: '#1827a0',
          700: '#03034b',
          500: '#0c5ee5',
        },
        gray: {
          50: '#f9f2f7',
          100: '#e8e4d5',
          200: '#e8e4d5',
          600: '#1827a0',
          900: '#1827a0',
        },
        white: '#f9f2f7',
      },
    },
  },
  plugins: [],
};

export default config;
