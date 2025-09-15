<template>
  <div class="wrapper" style="height: 9vh">
    <v-app-bar :elevation="3" rounded height="56">
      <v-app-bar-nav-icon
        v-if="hasApiKey"
        @click="() => (drawerOpen = !drawerOpen)"
      >
        <v-icon size="22">mdi-menu</v-icon>
      </v-app-bar-nav-icon>

      <v-app-bar-title class="text-h6">Simple PvP</v-app-bar-title>

      <v-menu v-if="hasApiKey">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon="mdi-dots-vertical"></v-btn>
        </template>

        <v-list>
          <v-list-item v-for="(item, index) in items" :key="index">
            <div>
              <v-icon>{{ item.icon }}</v-icon>
              <v-btn @click="activeRoute = item.redirect">
                {{ item.title }}
              </v-btn>
            </div>
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
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      isSidebarOpen: false,
      drawerOpen: false,
      items: [
        {
          title: "Profile",
          redirect: "profile",
          icon: "mdi-account",
        },
        {
          title: "Help",
          redirect: "help",
          icon: "mdi-exclamation",
        },
      ],
      activeRoute: "",
    };
  },
  components: {
    NavDrawer,
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
  },
};
</script>
