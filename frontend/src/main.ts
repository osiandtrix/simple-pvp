import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import store from "./store";
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-bootstrap.css";
import { Store } from "vuex/types/index.js";
import AppLogo from "./components/misc/AppLogo.vue";

loadFonts();

// Mount immediately; show loader until settings are ready
createApp(App)
  .use(store)
  .use(ToastPlugin)
  .use(vuetify)
  .component('AppLogo', AppLogo)
  .mount("#app");

// Initialize stores in the background
init(store).catch((error) => {
  console.error("Failed to initialize app:", error);
});

async function init(store: Store<unknown>) {
  store.dispatch("user/init");
  // Load settings (renderer will show loader until this resolves or fallback fires)
  await store.dispatch("settings/init");
  store.dispatch("wars/init");
  store.dispatch("process/init");
  store.dispatch("stats/init");
}
