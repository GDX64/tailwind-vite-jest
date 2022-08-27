import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './index.css';
import Home from './pages/Home.vue';
import BackGround from './pages/BackGround.vue';
import Test from './pages/QuickTest.vue';
import Pixi from './pixijs/pixi.vue';
import Grid from './components/Grid.vue';
import CV from './pages/CV.vue';
// import Wordle from './wordle/Wordle.vue';
import TickerPage from './rxjs/tickerformDemo/TickerPage.vue';
import Rough from './pages/Rough.vue';
import Set from './pages/Set.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/bg', component: BackGround },
  { path: '/test', component: Test },
  { path: '/pixi', component: Pixi },
  { path: '/animation', component: Pixi },
  { path: '/grid', component: Grid },
  { path: '/cv', component: CV },
  // { path: '/Wordle', component: Wordle },
  { path: '/ticker', component: TickerPage },
  { path: '/plot', component: Rough },
  { path: '/set', component: Set },
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
