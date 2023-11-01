<template>
  <v-card>
    <v-layout style="height: 90vh">
      <v-navigation-drawer v-model="drawer" temporary>
        <v-list density="compact" nav>
          <v-list-item
            @click="() => updateActiveElement('home')"
            prepend-icon="mdi-sword-cross"
            title="Home"
            value="home"
          ></v-list-item>

          <v-list-item
            @click="() => updateActiveElement('settings')"
            prepend-icon="mdi-cog"
            title="Settings"
            value="settings"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <component :is="activePage" />
      </v-main>
    </v-layout>
  </v-card>
</template>

<script lang="ts">
import Main from "../Main/Main.vue";
import Settings from "../Settings/Settings.vue";

export default {
  data() {
    return {
      drawer: false,
      activePage: Main.name,
    };
  },
  components: {
    Main,
    Settings,
  },
  methods: {
    updateActiveElement(val: string) {
      this.activePage = val;
      this.drawer = false;
      this.$emit("updateDrawer", false);
    },
  },
  props: {
    drawerHook: null,
    Content: null,
  },
  watch: {
    drawerHook(val) {
      this.drawer = val;
    },
  },
};
</script>
