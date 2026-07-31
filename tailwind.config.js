/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        polaris: {
          bg: '#f6f6f7',
          card: '#ffffff',
          border: '#e1e3e5',
          text: '#202223',
          subdued: '#6d7175',
          primary: '#008060',
          hover: '#006e52',
          surface: '#f1f2f3',
          dark: '#1a1d1f'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'polaris': '0px 1px 0px 0px rgba(22, 29, 37, 0.05), 0px 0px 0px 1px rgba(22, 29, 37, 0.15)',
        'polaris-hover': '0px 4px 12px 0px rgba(0, 0, 0, 0.08), 0px 0px 0px 1px rgba(22, 29, 37, 0.15)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
      }
    },
  },
  plugins: [],
}
