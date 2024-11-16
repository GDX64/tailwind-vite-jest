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
      sec: {
        ...colors.neutral,
        50: '#fff5f5',
      },
      high: colors.emerald,
      text: {
        prime: '#000000',
        label: '#6b7280',
        contrast: '#ffffff',
      },
      btn: {
        prime: '#000000',
        sec: '#ffffff',
        contrast: '#ffffff',
        secContrast: '#000000',
      },
      bg: {
        prime: '#ffffff',
        sec: '#ebebeb',
      },
      hover: colors.sky[500],
    },
    screens: {
      xs: '500px',
      sm: '640px',
      // => @media (min-width: 640px) { ... }

      md: '768px',
      // => @media (min-width: 768px) { ... }

      lg: '1024px',
      // => @media (min-width: 1024px) { ... }

      xl: '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
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
