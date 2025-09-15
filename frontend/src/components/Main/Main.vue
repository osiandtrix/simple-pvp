<template>
  <v-main class="modern-main">
    <v-container fluid class="pa-6">
      <!-- Setup Header Card -->
      <v-card class="modern-setup-card glass-effect mb-6" elevation="0">
        <v-card-title class="modern-card-title">
          <div class="d-flex align-center w-100 mb-3">
            <v-icon size="28" color="primary" class="mr-3">mdi-cog</v-icon>
            <h2 class="gradient-text font-weight-bold">Combat Setup</h2>
          </div>

          <!-- Keybinds Toggle -->
          <div class="d-flex align-center">
            <v-tooltip location="right">
              <template v-slot:activator="{ props }">
                <div v-bind="props" class="d-flex align-center">
                  <span class="text-caption mr-3 text-on-surface-variant">
                    {{ keybindsActive ? "Keybinds Active" : "Keybinds Disabled" }}
                  </span>
                  <v-switch
                    v-model="keybindsActive"
                    :disabled="!inCombat"
                    color="primary"
                    hide-details
                    density="compact"
                    class="modern-switch"
                  ></v-switch>
                </div>
              </template>
              <span>{{ keybindsActive ? "Disable Keybinds" : "Enable Keybinds" }}</span>
            </v-tooltip>
          </div>
        </v-card-title>

        <!-- Level Filters Section -->
        <v-card-text class="pt-2">
          <div class="mb-4">
            <h3 class="text-h6 mb-2 d-flex align-center">
              <v-icon size="20" color="accent" class="mr-2">mdi-filter</v-icon>
              Level Filters
            </h3>
            <p class="text-body-2 text-on-surface-variant mb-4">
              Set minimum and maximum level ranges for target generation
            </p>
            <v-alert
              v-if="!minLevelInput"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-4"
              icon="mdi-alert"
            >
              Minimum level is required to start target generation
            </v-alert>
          </div>

          <v-row class="mb-2">
            <v-col cols="6">
              <v-text-field
                v-model="minLevelInput"
                label="Minimum Level *"
                type="number"
                placeholder="Required (e.g., 0)"
                prepend-inner-icon="mdi-arrow-up"
                variant="outlined"
                density="comfortable"
                :error="!minLevelInput"
                :error-messages="!minLevelInput ? 'Minimum level is required' : ''"
                class="modern-input"
                :class="{ 'required-field': !minLevelInput }"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="maxLevelInput"
                label="Maximum Level"
                type="number"
                placeholder="No limit (optional)"
                prepend-inner-icon="mdi-arrow-down"
                variant="outlined"
                density="comfortable"
                hide-details
                class="modern-input"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Action Buttons -->
        <v-card-actions class="px-6 pb-6">
          <v-row class="ma-0">
            <v-col cols="6" class="pa-2">
              <v-btn
                :disabled="!minLevelInput"
                @click="saveLevels"
                prepend-icon="mdi-content-save"
                variant="outlined"
                color="success"
                size="large"
                block
                class="modern-btn"
              >
                Save Levels
              </v-btn>
            </v-col>
            <v-col cols="6" class="pa-2">
              <v-btn
                :disabled="
                  !minLevelInput ||
                  !warlist ||
                  inCombat ||
                  warlist.length === 0 ||
                  initiatingCombat
                "
                @click="enterCombat"
                prepend-icon="mdi-sword-cross"
                variant="flat"
                color="primary"
                size="large"
                block
                class="modern-btn combat-btn"
                :loading="initiatingCombat"
              >
                {{ initiatingCombat ? 'Preparing...' : 'Enter Combat' }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>

      <!-- Main Content Area -->
      <div class="modern-content-area">
        <EventLog v-if="inCombat" />
        <Warlist v-else :keySet="!!setAPIKey" />
      </div>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import Event from "../../types/Event";
import { mapGetters } from "vuex";
import Warlist from "./Warlist.vue";
import EventLog from "../EventLog/EventLog.vue";

export default {
  name: "main",
  data() {
    return {
      maxLevelInput: null,
      minLevelInput: null,
      keybindsActive: true,
      initiatingCombat: false,
    };
  },
  components: { Warlist, EventLog },
  mounted() {
    window.api.receive("spacebar", this.handleSpaceBar);
    window.api.receive("Control+Space", this.handleCtrlSpaceBar);

    this.maxLevelInput = this.savedMaxLevel;
    this.minLevelInput = this.savedMinLevel;
  },
  watch: {
    savedMaxLevel(val) {
      this.maxLevelInput = val;
    },
    savedMinLevel(val) {
      this.minLevelInput = val;
    },
    keybindsActive(val) {
      window.api.send("ignoreKeybinds", !val);
    },
    inCombat(val) {
      if (val) return;

      this.$store.dispatch("wars/reset");
      this.$store.dispatch("wars/init");
    },
  },
  computed: {
    ...mapGetters({
      inCombat: "process/inCombat",
      savedMaxLevel: "settings/maxLevel",
      savedMinLevel: "settings/minLevel",
      guildId: "user/guildId",
      setAPIKey: "settings/apiKey",
      warlist: "wars/warlist",
      targets: "wars/targets",
      targetIndex: "wars/targetIndex",
      currentTarget: "wars/currentTarget",
      currentWar: "wars/currentWar",
      activeGuildIndex: "wars/activeGuildIndex",
    }),
    apiLimitReached() {
      return this.$store.getters["process/apiLimit"] >= 40;
    },
    // Removed duplicate currentTarget - already available from mapGetters
    currentGuild() {
      return this.currentWar[
        this.guildId === this.currentWar.guild_2.id ? "guild_1" : "guild_2"
      ];
    },
  },
  methods: {
    sleep(ms: number) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    },
    newEvent(event: Event) {
      this.$store.dispatch("events/push", event);
    },
    handleCtrlSpaceBar() {
      this.$store.dispatch("wars/changeTargetIndex", -1);

      window.api.send("updateCurrentTarget", this.currentTarget.user_id);
    },
    async handleSpaceBar() {
      console.log("SPACEBAR");
      if (this.apiLimitReached) return this.showAPILimitError();
      if (
        this.activeGuildIndex >= this.warlist.length &&
        this.targetIndex === this.targets.length
      )
        return this.$toast.error("No More Targets");

      window.api.send("updateTargetHit", {
        userId: this.currentTarget.user_id,
        hit: 1,
      });
      this.newEvent({
        userId: this.currentTarget.user_id,
        userName: this.currentTarget.name,
        type: "attack",
      });

      this.$store.dispatch("wars/changeTargetIndex", 1);

      if (!this.currentTarget) await this.fetchTargets();

      window.api.send("updateCurrentTarget", this.currentTarget.user_id);

      if (this.targets.length - this.targetIndex >= 5) return;

      this.$toast.info("Fetching new Targets...");
      this.fetchTargets();
    },
    showAPILimitError() {
      const secondsTillReset: number =
        60 -
        (Math.floor(new Date().getTime() / 1000) -
          this.$store.getters["process/apiLimit_Stamp"]);

      this.$toast.error(
        `You have reached the API Limit. Try again in ${secondsTillReset}s`
      );
    },
    async fetchTargets() {
      const initialCount = this.targets.length === 0 ? -1 : this.targets.length;

      while (this.targets.length <= initialCount || !this.currentTarget) {
        this.$store.dispatch("process/updateApiLimit");
        if (this.apiLimitReached) {
          const resetIn = this.$store.getters["process/resetIn"];
          this.$toast.warning(
            `API Limit reached. Continuing Target generation in ${resetIn}s`
          );

          await this.sleep(resetIn * 1000);
        }

        await this.$store
          .dispatch("wars/fetchTargets", {
            guildId: this.currentGuild.id,
            apiKey: this.setAPIKey,
            maxLevel: this.maxLevelInput,
            minLevel: this.minLevelInput,
          })
          .then(() => {
            this.$store.dispatch("wars/getNextGuild");
          })
          .catch(() => {
            this.$store.dispatch("process/setApiLimit", 40);
          });
      }
    },
    async enterCombat() {
      this.initiatingCombat = true;
      await this.fetchTargets();

      window.api.send(
        "enterCombat",
        JSON.parse(JSON.stringify(this.currentTarget))
      );

      this.$store.dispatch("process/setInCombat", true);
      this.initiatingCombat = false;
    },
    saveLevels() {
      // Save both levels in a single call
      const levelData: any = {};

      if (this.maxLevelInput) {
        levelData.maxLevel = this.maxLevelInput;
      }

      levelData.minLevel = this.minLevelInput || 0;

      window.api.send("updateSettings", levelData);

      // Update store
      if (levelData.maxLevel !== undefined) {
        this.$store.commit("settings/UPDATE_MAXLEVEL", { maxLevel: levelData.maxLevel });
      }
      this.$store.commit("settings/UPDATE_MINLEVEL", { minLevel: levelData.minLevel });

      this.$toast.success("Level filters saved successfully.");
    },

  },
};
</script>

<style scoped>
.modern-main {
  height: calc(100vh - 64px);
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  overflow-y: auto;
}

.modern-setup-card {
  background: rgba(26, 26, 26, 0.85) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.modern-setup-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.modern-card-title {
  padding: 24px 24px 16px 24px;
}

.modern-input {
  transition: all 0.3s ease;
}

.modern-input:hover {
  transform: translateY(-1px);
}

.modern-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.025em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 48px;
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.9) 0%, rgba(58, 58, 58, 0.9) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.modern-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.combat-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
  color: white !important;
  border: 1px solid rgba(79, 70, 229, 0.3) !important;
  box-shadow:
    0 2px 8px rgba(79, 70, 229, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.combat-btn:hover {
  box-shadow:
    0 8px 25px rgba(79, 70, 229, 0.4),
    0 2px 8px rgba(79, 70, 229, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border-color: rgba(79, 70, 229, 0.5) !important;
}

.modern-switch {
  transform: scale(0.9);
}

.modern-content-area {
  margin-top: 0;
}

.required-field {
  border-color: rgb(var(--v-theme-error)) !important;
}

.required-field .v-field__outline {
  border-color: rgb(var(--v-theme-error)) !important;
}

.required-field .v-field__outline__start,
.required-field .v-field__outline__end {
  border-color: rgb(var(--v-theme-error)) !important;
}
</style>
