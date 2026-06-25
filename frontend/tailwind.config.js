/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        botlife: {
          primary: '#1a1a1a',
          secondary: '#333333',
          accent: '#00ffcc',
          text: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}
