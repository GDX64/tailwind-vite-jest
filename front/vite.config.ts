import { configDefaults } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import glsl from 'vite-plugin-glsl';
import svgLoader from 'vite-svg-loader';
import { defineConfig } from 'vite';
import auto from 'autoprefixer';
import tailwind from 'tailwindcss';
import solidPlugin from 'vite-plugin-solid';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig((args) => {
  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (el) => el === 'txt' || el === 'container',
          },
        },
      }) /*checker({ typescript: true }) */,
      glsl(),
      svgLoader(),
      solidPlugin({
        solid: {
          generate: 'universal',
          moduleName: '@solidRender/CustomRender',
        },
      }),
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
      host: true,
    },
    build: {
      sourcemap: false,
    },
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler.js',
        '@solidRender': path.resolve(__dirname, 'solidRender'),
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
