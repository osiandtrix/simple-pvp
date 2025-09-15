import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    outDir: "./../dist",
    chunkSizeWarningLimit: 1000,
    // Performance optimizations
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'vendor-vue': ['vue', 'vuex'],
          'vendor-ui': ['vuetify'],
          'vendor-utils': ['axios', 'vue-toast-notification']
        }
      }
    },
    // Enable compression
    cssCodeSplit: true,
    sourcemap: mode === 'development'
  },
  base: mode === "development" ? "" : "./",
  plugins: [
		vue({
      // Performance: reduce template compilation overhead
      template: {
        compilerOptions: {
          hoistStatic: true,
          cacheHandlers: true
        }
      }
    }),
		vuetify({
      autoImport: true
    }),
	],
  server: {
    port: 3000,
  },
  // Performance optimizations for development
  optimizeDeps: {
    include: ['vue', 'vuex', 'vuetify', 'axios']
  }
}));
