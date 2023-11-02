import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

export function startApp() {
  const app = createApp(App);
  app.mount("#app");
  return () => app.unmount();
}
