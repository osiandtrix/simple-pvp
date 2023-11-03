import { createStore } from "vuex";
import user from "./modules/user";
import settings from "./modules/settings";
import wars from "./modules/wars";
import process from "./modules/process";

export default createStore({
  modules: { user, wars, process, settings },
});
