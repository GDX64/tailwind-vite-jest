const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    colors: {
      ...colors,
      prime: colors.zinc,
      sec: colors.gray,
      high: colors.emerald,
    },
    extend: {},
  },
  plugins: [],
};
