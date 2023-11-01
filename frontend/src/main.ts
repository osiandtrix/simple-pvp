import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import store from "./store";
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-bootstrap.css";

loadFonts();

createApp(App)
  .use(store)
  .use(ToastPlugin)
  .use(vuetify)
  .mount("#app")
  .$nextTick(() => {
    store.dispatch("user/init");
    store.dispatch("settings/init");
    store.dispatch("wars/init");
  });
