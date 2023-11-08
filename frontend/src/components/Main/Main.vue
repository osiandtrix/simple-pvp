<template>
  <v-main style="height: 100vh; overflow: hidden">
    <v-card class="px-5">
      <v-card-title>
        <v-row class="mx-0 my-4">
          <v-col cols="10" class="px-0 pb-0">
            <h3 class="pt-4">Setup</h3>
          </v-col>
          <v-spacer></v-spacer>
          <v-col class="px-0 pb-0">
            <v-tooltip activator="parent" location="left">
              {{ keybindsActive ? "Unregister Keybinds" : "Register Keybinds" }}
            </v-tooltip>
            <v-switch
              :disabled="!inCombat"
              v-model="keybindsActive"
              color="blue"
            >
            </v-switch>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider class="mb-3 mx-3" style="margin-top: -1.2rem"></v-divider>

      <div>
        <v-text-field
          id="level-input"
          class="mx-3"
          label="Max Level"
          type="number"
          v-model="maxLevel"
          variant="solo"
          hide-details="auto"
        ></v-text-field>
      </div>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!maxLevel"
          @click="saveMaxLevel"
          prepend-icon="mdi-database-check-outline"
          variant="outlined"
          color="green"
        >
          Save
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn
          :disabled="
            !maxLevel ||
            !warlist ||
            inCombat ||
            warlist.length === 0 ||
            initiatingCombat
          "
          @click="enterCombat"
          prepend-icon="mdi-sword-cross"
          variant="outlined"
          color="red"
        >
          Enter Combat
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>

      <v-divider class="mx-4 mt-2"></v-divider>
    </v-card>

    <EventLog v-if="inCombat" />
    <Warlist v-else :keySet="!!setAPIKey" />
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
      maxLevel: this.savedMaxLevel,
      keybindsActive: true,
      initiatingCombat: false,
    };
  },
  components: { Warlist, EventLog },
  mounted() {
    window.api.receive("spacebar", this.handleSpaceBar);
    window.api.receive("Control+Space", this.handleCtrlSpaceBar);
    window.api.receive("Control+ArrowLeft", this.handleCtrlArrowLeft);
    window.api.receive("Shift+ArrowLeft", this.handleShiftArrowLeft);

    this.maxLevel = this.savedMaxLevel;
  },
  watch: {
    savedMaxLevel(val) {
      this.maxLevel = val;
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
    currentTarget() {
      return this.targets[this.targetIndex];
    },
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

    handleCtrlArrowLeft() {
      if (this.targetIndex === 0)
        return this.$toast.error("There is no prior target.");

      window.api.send("updateTargetHit", {
        userId: this.targets[this.targetIndex - 1].user_id,
        hit: -1,
      });

      this.$toast.success(
        `Successfully marked ${
          this.targets[this.targetIndex - 1].name
        } as 'not hit'`
      );

      this.newEvent({
        userId: this.targets[this.targetIndex - 1].user_id,
        userName: this.targets[this.targetIndex - 1].name,
        type: "nothit",
      });
    },
    handleShiftArrowLeft() {
      if (this.targetIndex === 0)
        return this.$toast.error("There is no prior target.");

      window.api.send("updateTargetHit", {
        userId: this.targets[this.targetIndex - 1].user_id,
        hit: 1,
      });

      this.$toast.success(
        `Successfully marked ${
          this.targets[this.targetIndex - 1].name
        } as 'hit'`
      );

      this.newEvent({
        userId: this.targets[this.targetIndex - 1].user_id,
        userName: this.targets[this.targetIndex - 1].name,
        type: "hit",
      });
    },
    handleCtrlArrowDown() {
      window.api.send("updateTargetHit", {
        userId: this.currentTarget.user_id,
        hit: -1,
      });

      this.$toast.success(
        `Successfully marked ${this.currentTarget.name} as 'not hit'`
      );

      this.newEvent({
        userId: this.currentTarget.user_id,
        userName: this.currentTarget.name,
        type: "nothit",
      });
    },
    handleShiftArrowDown() {
      window.api.send("updateTargetHit", {
        userId: this.currentTarget.user_id,
        hit: 1,
      });

      this.$toast.success(
        `Successfully marked ${this.currentTarget.name} as 'hit'`
      );

      this.newEvent({
        userId: this.currentTarget.user_id,
        userName: this.currentTarget.name,
        type: "hit",
      });
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
            maxLevel: this.maxLevel,
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
    saveMaxLevel() {
      this.$store.dispatch("settings/saveMaxLevel", {
        maxLevel: this.maxLevel,
      });

      this.$toast.success("Max Level saved successfully.");
    },
  },
};
</script>
