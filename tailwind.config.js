/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}","./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      colors: {
        "utama": "#45496a",
        "kedua": "#7d8bae",
        "merah": "#e5857b",
        "pink": "#f1b2b2",
        "coklat": "#e8ccc7"
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

