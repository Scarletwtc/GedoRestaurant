module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'gedo-green': '#1C4D32',
        'gedo-cream': '#F7F3E8',
        'gedo-brown': '#6B4D33',
        'gedo-gold': '#D4B96A',
        'gedo-red': '#C25B56',
      },
      boxShadow: {
        card: '0 10px 25px rgba(0,0,0,0.08)',
        hover: '0 14px 35px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 600ms ease-out both',
      },
      fontFamily: {
        playfair: ['\"Playfair Display\"', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'arabic-pattern': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMzAgMzBNMTUgMzBBMTUgMTUgMCAwIDEgMzAgMTVNNDUgMzBBMTUgMTUgMCAwIDEgMzAgNDVNMzAgMTVBMTUgMTUgMCAwIDEgNDUgMzBNMzAgNDVBMTUgMTUgMCAwIDEgMTUgMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFDNEQzMiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')",
      },
    },
  },
  plugins: [],
};
