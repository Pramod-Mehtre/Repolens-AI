/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1120',
        card: '#111827',
        primary: '#3B82F6',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
