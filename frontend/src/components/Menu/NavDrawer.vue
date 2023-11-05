<template>
  <v-card>
    <v-layout style="width: 100vw">
      <v-navigation-drawer style="position: fixed" v-model="drawer" temporary>
        <v-container
          style="height: 90vh; margin-top: 10vh"
          fill-height
          class="pa-0"
        >
          <v-list density="compact" nav>
            <v-list-item
              @click="() => updateActiveElement('main')"
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
        </v-container>
      </v-navigation-drawer>

      <v-main>
        <component @reload="reload" :is="activePage"></component>
      </v-main>
    </v-layout>
  </v-card>
</template>

<script lang="ts">
import Main from "../Main/Main.vue";
import Settings from "../Settings/Settings.vue";
import Profile from "../Profile/Profile.vue";
import Migrations from "../Migrations/Migrations.vue";

export default {
  name: "navdrawer",
  data() {
    return {
      drawer: false,
      activePage: Migrations.name,
    };
  },
  components: {
    Main,
    Settings,
    Profile,
    Migrations,
  },
  mounted() {
    window.api.receive("resolveVersion", ({ max, current }: any) => {
      if (parseInt(current) === parseInt(max)) this.activePage = Main.name;
    });
  },
  methods: {
    updateActiveElement(val: string) {
      this.drawer = false;

      if (this.activePage === Migrations.name)
        return this.$toast.error(
          "You must perform the update before switching pages"
        );

      if (this.$store.getters["process/inCombat"])
        return this.$toast.error("Cannot switch pages while in Combat");

      this.activePage = val;
    },
    reload() {
      location.reload();
    },
  },
  props: {
    forceReroute: {
      type: String,
      default: null,
    },
    drawerHook: {
      type: Boolean,
      default: null,
    },
  },
  watch: {
    drawerHook(val) {
      this.drawer = val;
    },
    drawer(val) {
      this.$emit("updateDrawer", val);
    },
    forceReroute(val) {
      this.activePage = val;
    },
  },
};
</script>
