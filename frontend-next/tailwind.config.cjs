module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        anker: {
          bg: '#05080f',
          surface: '#0b1220',
          card: '#101a2b',
          border: '#203047',
          accent: '#2aa9e0',
        },
      },
      boxShadow: {
        card: '0 18px 42px rgba(0, 0, 0, 0.24)',
        glow: '0 0 24px rgba(42, 169, 224, 0.22)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
