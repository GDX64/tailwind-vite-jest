import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import checker from 'vite-plugin-checker';
import glsl from 'vite-plugin-glsl';
import vueJSX from '@vitejs/plugin-vue-jsx';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), checker({ typescript: true }), glsl(), vueJSX(), svgLoader()],
});
