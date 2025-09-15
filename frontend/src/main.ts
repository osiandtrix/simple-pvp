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

createApp(App)
  .use(store)
  .use(ToastPlugin)
  .use(vuetify)
  .component('AppLogo', AppLogo)
  .mount("#app")
  .$nextTick(() => {
    init(store);
  });

function init(store: Store<unknown>) {
  store.dispatch("user/init");
  store.dispatch("settings/init");
  store.dispatch("wars/init");
  store.dispatch("process/init");
}
