import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { GElement } from "#els";
export { GElement };

export function startApp(el: HTMLElement) {
  const app = createApp(App);
  app.mount(el);
  return () => app.unmount();
}
