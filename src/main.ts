import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './index.css';
import Home from './pages/Home.vue';
import BackGround from './pages/BackGround.vue';
import Tests from './pages/Tests.vue';
const routes = [
  { path: '/', component: Home },
  { path: '/bg', component: BackGround },
  { path: '/test', component: Tests },
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes, // short for `routes: routes`
});

const app = createApp(App).use(router).mount('#app');
