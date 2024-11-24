import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';
import resolveConfig from 'tailwindcss/resolveConfig';

const prime = {
  // '50': '#f0f9ff',
  // '100': '#e0f2fe',
  // '200': '#bae6fd',
  // '300': '#9ee0ff',
  // '400': '#4ab9e9',
  // '500': '#2a9bcf',
  // '600': '#17a6ee',
  // '700': '#2689be',
  // '800': '#22739e',
  // '900': '#19587c',
  // '950': '#16405c',
  ...colors.sky,
};

export const designConfig = resolveConfig({
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx,md}'],
  safelist: ['opacity-0', 'opacity-100'],
  theme: {
    colors: {
      ...colors,
      prime,
      sec: {
        ...colors.neutral,
        50: '#fff5f5',
      },
      text: {
        prime: '#000000',
        label: '#6b7280',
        contrast: '#ffffff',
      },
      bg: {
        0: '#ffffff',
        ...colors.neutral,
        1000: '#000000',
      },
      hover: prime[500],
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
    extend: {
      animation: {
        pointd: 'pointd 1.5s ease-in-out infinite',
      },
      keyframes: {
        pointd: {
          '0%': { transform: 'translate(0, 0)' }, // No movement for the first 25%
          '33%': { transform: 'translate(2px, -2px)' },
          '66%, 100%': { transform: 'translate(0, 0)' }, // No movement for the last 25%
        },
      },
    },
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
});

export default designConfig;
