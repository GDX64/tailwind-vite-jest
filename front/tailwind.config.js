const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx,md}'],
  theme: {
    colors: {
      ...colors,
      prime: {
        ...colors.sky,
        50: '#ffffff',
      },
      high: colors.emerald,
      text: {
        prime: '#000000',
        label: '#6b7280',
      },
      btn: {
        prime: '#000000',
        sec: '#ffffff',
        contrast: '#ffffff',
        secContrast: '#000000',
      },
      bg: {
        prime: '#ffffff',
        sec: '#d1d1d1',
      },
      hover: colors.sky[500],
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
