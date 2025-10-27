<template>
  <v-card>
    <v-layout style="width: 100vw">
      <v-navigation-drawer style="position: fixed" v-model="drawer" temporary>
        <v-container
          style="height: 91vh; margin-top: 9vh"
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
        <!-- Loader while settings load -->
        <div v-if="!settingsLoaded" class="d-flex align-center justify-center" style="height: calc(100vh - 64px);">
          <v-progress-circular indeterminate color="primary" size="48" />
        </div>

        <!-- Show API key setup only after we know settings are loaded -->
        <ApiKeySetup
          v-else-if="!hasApiKey"
          @apiKeyConfigured="onApiKeyConfigured"
        />
        <component
          v-else
          @reload="reload"
          :is="activePage"
        ></component>
      </v-main>
    </v-layout>
  </v-card>
</template>

<script lang="ts">
import Main from "../Main/Main.vue";
import Settings from "../Settings/Settings.vue";
import Migrations from "../Migrations/Migrations.vue";
import ApiKeySetup from "../Setup/ApiKeySetup.vue";
import AppLogo from "../misc/AppLogo.vue";
import { mapGetters } from "vuex";

export default {
  name: "navdrawer",
  data() {
    return {
      drawer: false,
      activePage: Main.name,
    };
  },
  components: {
    Main,
    Settings,
    Migrations,
    ApiKeySetup,
    AppLogo,
  },
  computed: {
    ...mapGetters({
      apiKey: "settings/apiKey",
      settingsLoaded: "settings/settingsLoaded",
    }),
    hasApiKey() {
      return this.apiKey && this.apiKey.length > 0;
    },
  },
  methods: {
    updateActiveElement(val: string) {
      this.drawer = false;

      if (this.$store.getters["process/inCombat"])
        return this.$toast.error("Cannot switch pages while in Combat");

      this.activePage = val;
      // Removed unnecessary page reload when navigating to home
    },
    reload() {
      location.reload();
    },
    onApiKeyConfigured() {
      // Force a reload to refresh the store state
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
