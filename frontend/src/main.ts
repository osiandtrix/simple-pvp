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

// Initialize core store modules before mounting so saved settings (like API key) are ready
// Wait for settings to load before mounting the app
init(store).then(() => {
  createApp(App)
    .use(store)
    .use(ToastPlugin)
    .use(vuetify)
    .component('AppLogo', AppLogo)
    .mount("#app");
});

async function init(store: Store<unknown>) {
  store.dispatch("user/init");
  // Wait for settings to load (especially API key) before mounting
  await store.dispatch("settings/init");
  store.dispatch("wars/init");
  store.dispatch("process/init");
  store.dispatch("stats/init");
}
