<template>
  <v-app>
    <v-main>
      <Menu />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Menu from "./components/Menu/Menu.vue";
import Main from "./components/Main/Main.vue";

export default {
  name: "App",
  components: {
    Main,
    Menu,
  },
  data() {
    return {};
  },
};
</script>
