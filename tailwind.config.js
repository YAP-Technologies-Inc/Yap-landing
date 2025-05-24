/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
    "./src/**/*"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#fdcc1e',
          600: '#e6bf1a',
        },
        yap: '#4372c4',
        'yap-dark': '#375ea8'
      }
    },
  },
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
    defaultLineHeights: true,
    standardFontWeights: true
  }
}

