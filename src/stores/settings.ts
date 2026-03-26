import { defineStore } from "pinia";
import { invoke } from "@tauri-apps/api/core";

interface Settings {
  min_level: number;
  max_level: number | null;
  api_key: string | null;
  always_on_top: boolean;
  keybinds_enabled: boolean;
  embedded_combat: boolean;
}

interface Keybind {
  original_key: string;
  new_key: string;
  description: string;
  locked: boolean;
}

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    minLevel: 0 as number,
    maxLevel: null as number | null,
    apiKey: null as string | null,
    keybindsEnabled: true,
    embeddedCombat: false,
    keybinds: [] as Keybind[],
    appVersion: "",
  }),

  actions: {
    async init() {
      const [settings, version] = await Promise.all([
        invoke<Settings>("fetch_settings"),
        invoke<string>("fetch_version"),
      ]);
      this.minLevel = settings.min_level;
      this.maxLevel = settings.max_level;
      this.apiKey = settings.api_key;
      this.keybindsEnabled = settings.keybinds_enabled;
      this.embeddedCombat = settings.embedded_combat;
      this.appVersion = version;
    },

    async saveApiKey(apiKey: string) {
      await invoke("update_settings", { minLevel: null, maxLevel: null, apiKey, keybindsEnabled: null, embeddedCombat: null });
      this.apiKey = apiKey;
    },

    async saveMinLevel(minLevel: number) {
      await invoke("update_settings", { minLevel, maxLevel: null, apiKey: null, keybindsEnabled: null, embeddedCombat: null });
      this.minLevel = minLevel;
    },

    async saveMaxLevel(maxLevel: number) {
      await invoke("update_settings", { minLevel: null, maxLevel, apiKey: null, keybindsEnabled: null, embeddedCombat: null });
      this.maxLevel = maxLevel;
    },

    async saveKeybindsEnabled(enabled: boolean) {
      await invoke("update_settings", { minLevel: null, maxLevel: null, apiKey: null, keybindsEnabled: enabled, embeddedCombat: null });
      this.keybindsEnabled = enabled;
    },

    async saveEmbeddedCombat(enabled: boolean) {
      await invoke("update_settings", { minLevel: null, maxLevel: null, apiKey: null, keybindsEnabled: null, embeddedCombat: enabled });
      this.embeddedCombat = enabled;
    },

    async fetchKeybinds() {
      this.keybinds = await invoke<Keybind[]>("fetch_keybinds");
    },

    async updateKeybind(originalKey: string, newKey: string) {
      await invoke("update_keybind", { originalKey, newKey });
      await invoke("register_shortcuts");
      await this.fetchKeybinds();
    },
  },
});
