/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#e67e22',
        'primary-dark': '#d35400',
        'text-dark': '#333',
        'text-light': '#555',
        'text-muted': '#777',
        'bg-light': '#f9f9f9',
        'bg-lighter': '#f5f5f5',
      },
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
      },
      minHeight: {
        '600': '600px',
      },
      boxShadow: {
        'card': '0 5px 15px rgba(0, 0, 0, 0.05)',
        'image': '0 5px 15px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
