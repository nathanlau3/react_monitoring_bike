/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}","./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: "#0E1D54",
        secondary: "#597AAF",
        tertiary: "#A4B4CB",
    
        latar1: "#ECEDEF",
        latar2: "#E8EAED",
        latar3: "#FFFFFF",
    
        white: "#F3F4F8",
        lightWhite: "#FAFAFC",
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

