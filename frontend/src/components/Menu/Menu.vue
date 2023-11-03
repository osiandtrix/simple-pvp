<template>
  <div class="wrapper" style="height: 10vh">
    <v-app-bar :elevation="3" rounded>
      <v-app-bar-nav-icon @click="() => (drawerOpen = !drawerOpen)">
        <v-icon>mdi-menu</v-icon>
      </v-app-bar-nav-icon>

      <v-app-bar-title>The orbital cannon of PvP tools</v-app-bar-title>

      <v-menu>
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
