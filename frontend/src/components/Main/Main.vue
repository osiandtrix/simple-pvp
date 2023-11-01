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
  </v-main>
</template>

<script lang="ts">
export default {
  name: "main",
  data() {
    return {
      inCombat: false,
    };
  },
  computed: {
    maxLevel() {
      return this.$store.getters["settings/maxLevel"];
    },
  },
  methods: {
    enterCombat() {
      // emit event to electron
      this.inCombat = true;
    },
    saveMaxLevel() {
      //
    },
  },
};
</script>
