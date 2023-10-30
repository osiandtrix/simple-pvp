import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    outDir: "./../dist",
    chunkSizeWarningLimit: 1000,
  },
  base: mode === "development" ? "" : "./",
  plugins: [
		vue(),
		vuetify({ autoImport: true }),
	],
  server: {
    port: 3000,
  },
}));
