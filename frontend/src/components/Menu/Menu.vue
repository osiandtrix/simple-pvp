<template>
  <div class="wrapper" style="height: 10vh">
    <v-app-bar :elevation="3" rounded>
      <v-app-bar-nav-icon @click="() => (drawerOpen = !drawerOpen)">
        <v-icon>mdi-menu</v-icon>
      </v-app-bar-nav-icon>

      <v-app-bar-title>The orbital cannon of PvP tools</v-app-bar-title>

      <template v-slot:append>
        <v-btn icon="mdi-dots-vertical"></v-btn>
      </template>
    </v-app-bar>

    <NavDrawer @updateDrawer="updateDrawer" v-bind:drawerHook="drawerOpen" />
  </div>
</template>

<script lang="ts">
import NavDrawer from "./NavDrawer.vue";

export default {
  data() {
    return {
      isSidebarOpen: false,
      drawerOpen: false,
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
