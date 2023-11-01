<template>
  <v-card class="pa-5">
    <v-row class="my-2" v-if="!keySet">
      <v-spacer></v-spacer>
      You need to set an API key
    </v-row>
    <v-card-title>
      <v-row class="pt-2">
        <div>Warlist</div>
        <v-spacer></v-spacer>

        <v-btn icon :disabled="!keySet">
          <v-icon>mdi-shuffle-variant</v-icon>
          <v-tooltip activator="parent" location="top">
            Shuffle Wars
          </v-tooltip>
        </v-btn>

        <v-btn icon class="mx-2" :disabled="!keySet">
          <v-icon>mdi-shield-refresh-outline</v-icon>
          <v-tooltip activator="parent" location="top">
            Update War Data
          </v-tooltip>
        </v-btn>
      </v-row>

      More content
    </v-card-title>
  </v-card>
</template>

<script lang="ts">
export default {
  name: "warlist",
  data() {
    return {};
  },
  props: {
    keySet: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
