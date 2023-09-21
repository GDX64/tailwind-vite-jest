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
  { path: '/text-quality', component: () => import('./pages/TextQualityTest.vue') },
  { path: '/gravity', component: () => import('./pages/Gravity.vue') },
  { path: '/projection', component: () => import('./pages/Projection/Projection.vue') },
  { path: '/aninha', component: () => import('./pages/Aninha.vue') },
  { path: '/layout-test', component: () => import('./pages/LayoutTest/LayoutTest.vue') },
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
