<template>
  <div class="modern-navbar">
    <v-app-bar
      :elevation="0"
      height="64"
      class="glass-effect modern-navbar-bar"
      style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);"
    >
      <!-- Navigation Icon -->
      <v-app-bar-nav-icon
        v-if="hasApiKey"
        @click="() => (drawerOpen = !drawerOpen)"
        class="modern-nav-icon"
      >
        <v-icon size="24" color="primary">mdi-menu</v-icon>
      </v-app-bar-nav-icon>

      <!-- Brand Logo & Title -->
      <div class="d-flex align-center ml-2">
        <AppLogo :size="32" class="mr-3" />
        <v-app-bar-title class="modern-title gradient-text font-weight-bold">
          Simple PvP
        </v-app-bar-title>
      </div>

      <v-spacer></v-spacer>

      <!-- Status Indicator (when API key is set) -->
      <div v-if="hasApiKey" class="d-flex align-center mr-4">
        <v-chip
          size="small"
          color="success"
          variant="flat"
          prepend-icon="mdi-check-circle"
          class="modern-status-chip"
        >
          Connected
        </v-chip>
      </div>

      <!-- Action Menu -->
      <v-menu v-if="hasApiKey" offset-y>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            variant="text"
            class="modern-menu-btn"
          >
            <v-icon size="24" color="on-surface">mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list class="modern-menu-list">
          <v-list-item
            v-for="(item, index) in items"
            :key="index"
            @click="handleMenuClick(item.redirect)"
            class="modern-menu-item"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon" color="primary"></v-icon>
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <NavDrawer
      @updateDrawer="updateDrawer"
      :drawerHook="drawerOpen"
      :forceReroute="activeRoute"
    />
  </div>
</template>

<script lang="ts">
import NavDrawer from "./NavDrawer.vue";
import AppLogo from "../misc/AppLogo.vue";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      isSidebarOpen: false,
      drawerOpen: false,
      items: [
        {
          title: "Logout",
          redirect: "logout",
          icon: "mdi-logout",
        },
      ],
      activeRoute: "",
    };
  },
  components: {
    NavDrawer,
    AppLogo,
  },
  computed: {
    ...mapGetters({
      apiKey: "settings/apiKey",
    }),
    hasApiKey() {
      return this.apiKey && this.apiKey.length > 0;
    },
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    updateDrawer(val: boolean) {
      this.drawerOpen = val;
    },
    handleMenuClick(redirect: string) {
      if (redirect === 'logout') {
        this.logout();
      } else {
        this.activeRoute = redirect;
      }
    },
    logout() {
      // Clear API key and user data from store
      this.$store.dispatch("settings/saveAPIKey", { api_key: "" });
      this.$store.commit("user/SET_USERID", { userId: null });
      this.$store.commit("user/SET_GUILDID", { guildId: null });

      // Clear wars data
      this.$store.commit("wars/CLEAR_WARLIST");
      this.$store.commit("wars/CLEAR_TARGETS");

      // Show success message
      this.$toast.success("Logged out successfully");

      // Reload the application to reset state
      location.reload();
    },
  },
};
</script>

<style scoped>
.modern-navbar {
  height: 64px;
  position: relative;
  z-index: 1000;
}

.modern-navbar-bar {
  background: rgba(26, 26, 26, 0.95) !important;
  backdrop-filter: blur(20px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.modern-nav-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-nav-icon:hover {
  background-color: rgba(79, 70, 229, 0.1);
  transform: scale(1.05);
}

.modern-title {
  font-size: 1.5rem !important;
  letter-spacing: -0.025em;
}

.modern-status-chip {
  font-weight: 600;
  font-size: 0.75rem;
}

.modern-menu-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.modern-menu-btn:hover {
  background-color: rgba(58, 58, 58, 0.3) !important;
  transform: scale(1.05);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.modern-menu-list {
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-top: 8px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.modern-menu-item {
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 4px 8px;
}

.modern-menu-item:hover {
  background-color: rgba(58, 58, 58, 0.3);
  transform: translateX(4px);
}
</style>
