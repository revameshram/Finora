/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          dark: '#1C1917',     // Crisp dark text on white
          canvas: '#FAFAF9',   // Light, airy, pure soft canvas
          surface: '#FFFFFF',  // Clean white card surfaces
          wire: '#E7E5E4',     // Clean subtle 1px border
          muted: '#78716C',    // Subdued secondary text
          warm: '#FBF8F3',     // Subtle warm tint background for highlights
          amber: '#B45309',    // Warm honey/amber accent
          'amber-light': '#FEF3C7',
          slate: '#334155',    // Clean slate for neutral badges
          'slate-light': '#F1F5F9',
          rose: '#BE123C',     // Subtle rose for liabilities
          'rose-light': '#FFE4E6',
        },
      },
    },
  },
  plugins: [],
}
