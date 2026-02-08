import { defineStore } from "pinia";
import { invoke } from "@tauri-apps/api/core";

interface Settings {
  max_level: number | null;
  api_key: string | null;
  always_on_top: boolean;
}

interface Keybind {
  original_key: string;
  new_key: string;
  description: string;
}

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    maxLevel: null as number | null,
    apiKey: null as string | null,
    alwaysOnTop: false,
    keybinds: [] as Keybind[],
    appVersion: "",
  }),

  actions: {
    async init() {
      const [settings, version] = await Promise.all([
        invoke<Settings>("fetch_settings"),
        invoke<string>("fetch_version"),
      ]);
      this.maxLevel = settings.max_level;
      this.apiKey = settings.api_key;
      this.alwaysOnTop = settings.always_on_top;
      this.appVersion = version;
    },

    async saveApiKey(apiKey: string) {
      await invoke("update_settings", { max_level: null, api_key: apiKey });
      this.apiKey = apiKey;
    },

    async saveMaxLevel(maxLevel: number) {
      await invoke("update_settings", { max_level: maxLevel, api_key: null });
      this.maxLevel = maxLevel;
    },

    async setAlwaysOnTop(enabled: boolean) {
      await invoke("set_always_on_top", { enabled });
      this.alwaysOnTop = enabled;
    },

    async fetchKeybinds() {
      this.keybinds = await invoke<Keybind[]>("fetch_keybinds");
    },

    async updateKeybind(originalKey: string, newKey: string) {
      await invoke("update_keybind", { original_key: originalKey, new_key: newKey });
      await invoke("register_shortcuts");
      await this.fetchKeybinds();
    },
  },
});
