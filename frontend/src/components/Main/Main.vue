<template>
  <v-main style="height: 100vh; overflow: hidden">
    <v-card class="pa-5">
      <v-card-title>
        <v-row>
          <v-col cols="10">
            <h1>Setup</h1>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-tooltip activator="parent" location="left">
              Spacebar Keybind
            </v-tooltip>
            <v-switch
              :disabled="!inCombat"
              v-model="spacebarKeybind"
              color="blue"
            >
            </v-switch>
          </v-col>
        </v-row>
      </v-card-title>

      <div>
        <v-text-field
          class="mx-3"
          label="Max Level"
          type="number"
          v-model="maxLevel"
          variant="solo"
        ></v-text-field>
      </div>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!maxLevel"
          @click="saveMaxLevel"
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
    </v-card>
    <Warlist :keySet="!!setAPIKey" />
  </v-main>
</template>

<script lang="ts">
import { mapGetters } from "vuex";
import Warlist from "./Warlist.vue";

export default {
  name: "main",
  data() {
    return {
      maxLevel: this.savedMaxLevel,
      combatWindow: null,
      spacebarKeybind: false,
      targetList: [],
      initiatingCombat: false,
    };
  },
  components: { Warlist },
  mounted() {
    window.api.receive("spacebar", () => {
      if (this.apiLimitReached) return this.showAPILimitError();
      this.$store.dispatch("wars/changeTargetIndex", 1);

      window.api.send("updateCurrentTarget", this.currentTarget.user_id);

      if (this.targets.length - this.targetIndex < 5) {
        this.fetchTargets();
        this.$store.dispatch("wars/getNextGuild");
      }
    });

    this.maxLevel = this.savedMaxLevel;
  },
  watch: {
    savedMaxLevel(val) {
      this.maxLevel = val;
    },
    spacebarKeybind(val) {
      window.api.send("setSpacebarKeybind", val);
    },
    inCombat(val) {
      if (val) return;

      this.spacebarKeybind = val;
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
      this.$store.dispatch("process/updateApiLimit");

      return this.$store
        .dispatch("wars/fetchTargets", {
          guildId: this.currentGuild.id,
          apiKey: this.setAPIKey,
          maxLevel: this.maxLevel,
        })
        .catch(() => {
          this.$store.dispatch("process/setApiLimit", 40);
        });
    },
    async enterCombat() {
      this.initiatingCombat = true;
      await this.fetchTargets();

      this.$store.dispatch("wars/getNextGuild");

      while (!this.currentTarget) {
        if (this.apiLimitReached)
          await this.sleep(this.$store.getters["process/resetIn"] * 1000);

        await this.fetchTargets();
        this.$store.dispatch("wars/getNextGuild");

        if (this.apiLimitReached)
          this.$toast.warning(
            "API Limit reached. Continuing Target generation in one minute"
          );
      }

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
