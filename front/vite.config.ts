import { configDefaults } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import checker from 'vite-plugin-checker';
import glsl from 'vite-plugin-glsl';
import svgLoader from 'vite-svg-loader';
import { defineConfig } from 'vite';
import auto from 'autoprefixer';
import tailwind from 'tailwindcss';
import solidPlugin from 'vite-plugin-solid';

// https://vitejs.dev/config/
export default defineConfig((args) => {
  return {
    plugins: [
      vue() /*checker({ typescript: true }) */,
      glsl(),
      svgLoader(),
      solidPlugin(),
    ],
    test: {
      globals: true,
      environment: 'happy-dom',
      exclude: [...configDefaults.exclude],
      include: ['./src/**/**.test.ts'],
    },
    css: getCssConfig(args.mode),
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
      },
    },
    build: {
      sourcemap: true,
    },
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler.js',
      },
    },
  };
});

function getCssConfig(mode: string) {
  if (mode === 'test') {
    return {};
  }
  return { postcss: { plugins: [auto(), tailwind()] } };
}
