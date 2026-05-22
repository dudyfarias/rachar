/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          300: '#6EE7B7',
          500: '#00A676',
          600: '#008F68',
          700: '#047857',
          900: '#064E3B',
        },
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          300: '#CBD5E1',
          500: '#64748B',
          700: '#334155',
          900: '#0F172A',
        },
        money: {
          100: '#F2FCE2',
          500: '#B6F000',
          700: '#6A9300',
        },
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['System'],
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.10)',
      },
    },
  },
  plugins: [],
};
