import { configDefaults } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import checker from 'vite-plugin-checker';
import glsl from 'vite-plugin-glsl';
import vueJSX from '@vitejs/plugin-vue-jsx';
import svgLoader from 'vite-svg-loader';
import { defineConfig } from 'vite';
import auto from 'autoprefixer';
import tailwind from 'tailwindcss';

// https://vitejs.dev/config/
export default defineConfig((args) => {
  return {
    plugins: [vue(), checker({ typescript: true }), glsl(), vueJSX(), svgLoader()],
    test: {
      globals: true,
      environment: 'happy-dom',
      exclude: [...configDefaults.exclude],
      include: ['./src/**/**.test.ts'],
    },
    css: getCssConfig(args.mode),
  };
});

function getCssConfig(mode: string) {
  if (mode === 'test') {
    return {};
  }
  return { postcss: { plugins: [auto(), tailwind()] } };
}
