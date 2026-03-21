<script setup lang="ts">
import { ref, onMounted } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AppSidebar from "./components/AppSidebar.vue";
import MainView from "./components/MainView.vue";
import SettingsView from "./components/SettingsView.vue";
import ChangelogView from "./components/ChangelogView.vue";
import BlockedView from "./components/BlockedView.vue";
import CooldownsView from "./components/CooldownsView.vue";
import { Toaster } from "vue-sonner";
import { useUserStore } from "./stores/user";
import { useSettingsStore } from "./stores/settings";
import { useWarsStore } from "./stores/wars";
import { useProcessStore } from "./stores/process";
import { useBlocklistStore } from "./stores/blocklist";

const user = useUserStore();
const settings = useSettingsStore();
const wars = useWarsStore();
const process = useProcessStore();
const blocklist = useBlocklistStore();

const sidebarOpen = ref(false);
const activePage = ref("main");

onMounted(async () => {
  await Promise.all([
    user.init(),
    settings.init(),
    wars.init(),
    process.init(),
    blocklist.init(),
  ]);
});

const pages: Record<string, any> = {
  main: MainView,
  settings: SettingsView,
  blocked: BlockedView,
  cooldowns: CooldownsView,
  changelog: ChangelogView,
};
</script>

<template>
  <div class="flex h-screen flex-col bg-background">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <AppSidebar
      v-model:open="sidebarOpen"
      :active-page="activePage"
      @navigate="activePage = $event"
    />
    <main class="flex-1 overflow-auto p-3">
      <div class="animate-in">
        <component :is="pages[activePage]" />
      </div>
    </main>
    <Toaster
      position="bottom-right"
      theme="dark"
      :toast-options="{
        style: {
          background: 'hsl(0 0% 4%)',
          border: '1px solid hsl(0 0% 12%)',
          color: 'hsl(0 0% 93%)',
          fontFamily: 'DM Sans, sans-serif',
        },
      }"
    />
  </div>
</template>
