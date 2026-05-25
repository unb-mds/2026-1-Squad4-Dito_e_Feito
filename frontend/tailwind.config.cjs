/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fundo: '#0F172A',
        surface: '#1E293B',
        card: '#1E293B',
        'texto-principal': '#F8FAFC',
        'texto-secundario': '#94A3B8',
        'brand-petroleo': '#0F766E',
        'brand-sucesso': '#166534',
        'brand-alerta': '#831843',
        primaria: '#0F766E',
        alerta: '#831843',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['IBM Plex Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}