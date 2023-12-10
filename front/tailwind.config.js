const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    colors: {
      ...colors,
      prime: colors.sky,
      sec: colors.gray,
      high: colors.emerald,
    },
    extend: {},
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.my-section-title': {
          'text-decoration': 'underline',
          'font-size': '1.5rem',
          'font-weight': '600',
          'margin-bottom': '0.75rem',
        },
        '.my-external-ref': {
          'text-decoration': 'underline',
          'font-weight': '600',
        },
      });
    }),
  ],
};
