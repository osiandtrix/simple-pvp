<script setup lang="ts">
import { ref, onMounted } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AppSidebar from "./components/AppSidebar.vue";
import MainView from "./components/MainView.vue";
import SettingsView from "./components/SettingsView.vue";
import ChangelogView from "./components/ChangelogView.vue";
import { Toaster } from "vue-sonner";
import { useUserStore } from "./stores/user";
import { useSettingsStore } from "./stores/settings";
import { useWarsStore } from "./stores/wars";
import { useProcessStore } from "./stores/process";

const user = useUserStore();
const settings = useSettingsStore();
const wars = useWarsStore();
const process = useProcessStore();

const sidebarOpen = ref(false);
const activePage = ref("main");

onMounted(async () => {
  await Promise.all([
    user.init(),
    settings.init(),
    wars.init(),
    process.init(),
  ]);
});

const pages: Record<string, any> = {
  main: MainView,
  settings: SettingsView,
  changelog: ChangelogView,
};
</script>

<template>
  <div class="flex h-screen flex-col">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <AppSidebar
      v-model:open="sidebarOpen"
      :active-page="activePage"
      @navigate="activePage = $event"
    />
    <main class="flex-1 overflow-auto p-4">
      <component :is="pages[activePage]" />
    </main>
    <Toaster position="bottom-right" theme="dark" />
  </div>
</template>
