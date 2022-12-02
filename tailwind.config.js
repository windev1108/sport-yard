
/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#85c240",
        secondary: "#212121"
      },
      keyframes : {
        'ripple' : {
          '0%': {
            boxShadow: "0 0 0 0px #44b700" ,
          },
          '100%': {
            boxShadow: "0 0 0 3px transparent",
          },
        }
      },
      animation : {
        "ripple" : 'ripple 1.2s cubic-bezier(0, 0, 0.2, 1) infinite'
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
