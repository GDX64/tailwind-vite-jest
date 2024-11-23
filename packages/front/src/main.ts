import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Home from './pages/Home.vue';
import './index.css';

const routes = [
  { path: '/', component: Home },
  { path: '/grid', component: () => import('./components/Grid.vue') },
  { path: '/cv', component: () => import('./pages/CV.vue') },
  { path: '/tippy', component: () => import('./pages/TippyTest.vue') },
  { path: '/layers', component: () => import('./pages/Layers.vue') },
  { path: '/noise', component: () => import('./pages/Noise/PerlinNoise.vue') },
  { path: '/base64', component: () => import('./pages/Base64.vue') },
  { path: '/wasm-chart', component: () => import('./pages/WasmChart.vue') },
  { path: '/gravity', component: () => import('./pages/Gravity.vue') },
  { path: '/projection', component: () => import('./pages/Projection/Projection.vue') },
  { path: '/libtest', component: () => import('./pages/LibTest.vue') },
  { path: '/testWorker', component: () => import('./pages/TestWorkers.vue') },
  { path: '/canvas_game', component: () => import('./pages/CanvasGame.vue') },
  { path: '/stack', component: () => import('./pages/orderStack/OrderStack.vue') },
  { path: '/kite', component: () => import('./components/kite/Kite.vue') },
  { path: '/yoga', component: () => import('./pages/YogaTest/YogaTest.vue') },
  { path: '/space-index', component: () => import('./pages/spaceIndex/SpaceIndex.vue') },
  {
    path: '/audio-things',
    component: () => import('./pages/audioExperiments/AudiosThings.vue'),
  },
  {
    path: '/simd-rasterization',
    component: () => import('./pages/SIMDRasterization/SIMDRasterization.vue'),
  },
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes, // short for `routes: routes`
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0, behavior: 'smooth' };
  },
});

createApp(App).use(router).mount('#app');
