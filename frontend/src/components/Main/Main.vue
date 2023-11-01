<template>
  <v-main>
    <v-card class="pa-5">
      <v-card-title>Setup</v-card-title>

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
          :disabled="!maxLevel"
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
import Warlist from "./Warlist.vue";

export default {
  name: "main",
  data() {
    return {
      maxLevel: this.savedMaxLevel,
      inCombat: false,
    };
  },
  components: { Warlist },
  mounted() {
    this.maxLevel = this.savedMaxLevel;
  },
  watch: {
    savedMaxLevel(val) {
      this.maxLevel = val;
    },
  },
  computed: {
    savedMaxLevel() {
      return this.$store.getters["settings/maxLevel"];
    },
    setAPIKey() {
      return this.$store.getters["settings/apiKey"];
    },
  },
  methods: {
    enterCombat() {
      console.log(this.$store.getters["settings/maxLevel"]);
      // emit event to electron
      this.inCombat = true;
    },
    saveMaxLevel() {
      this.$store.dispatch("settings/saveMaxLevel", {
        maxLevel: this.maxLevel,
      });

      this.$toast.success("");
    },
  },
};
</script>
