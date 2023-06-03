import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Home from './pages/Home.vue';
import './index.css';

const routes = [
  { path: '/', component: Home },
  { path: '/pixi', component: () => import('./pixijs/pixi.vue'), name: 'pixi' },
  { path: '/grid', component: () => import('./components/Grid.vue') },
  { path: '/cv', component: () => import('./pages/CV.vue') },
  { path: '/plot', component: () => import('./pages/Rough.vue') },
  { path: '/tippy', component: () => import('./pages/TippyTest.vue') },
  { path: '/gpgpu', component: () => import('./pages/GPGPU.vue') },
  { path: '/layers', component: () => import('./pages/Layers.vue') },
  { path: '/solid', component: () => import('./pages/Solid.vue') },
  { path: '/lua', component: () => import('./pages/LuaEmb.vue') },
  { path: '/noise', component: () => import('./pages/Noise/PerlinNoise.vue') },
  { path: '/roughSimple', component: () => import('./pages/SimpleRenderer.vue') },
  { path: '/dom', component: () => import('./pages/PixiDOM/PixiDOM.vue') },
  { path: '/workerdraw', component: () => import('./pages/WorkerDraw/WorkerDraw.vue') },
  { path: '/dsp', component: () => import('./pages/DSP/SmoothScroll.vue') },
  // { path: '/set', component: Set },
  // { path: '/Wordle', component: Wordle },
  // { path: '/hilbert', component: Hilbert },
  // { path: '/ball', component: BallAnimation },
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes, // short for `routes: routes`
});

createApp(App).use(router).mount('#app');
