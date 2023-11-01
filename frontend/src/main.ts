import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import store from "./store";

loadFonts();

createApp(App)
  .use(store)
  .use(vuetify)
  .mount("#app")
  .$nextTick(() => {
    store.dispatch("user/init");
    store.dispatch("settings/init");
  });
