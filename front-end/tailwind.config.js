module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  purge: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: '#003A70',
        secondary: '#657786',
        tertiary: '#add8e6'
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'jakarta-sans': ['Plus Jakarta Sans', 'sans-serif']
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('tailwindcss/colors'),
    require("tailwindcss-animation-delay"),
  ],
  important: true
}
