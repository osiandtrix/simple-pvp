<template>
  <v-row class="pa-0 ma-0">
    <v-col class="pa-0" v-for="(kkey, i) in keys">
      <div style="display: flex; justify-content: space-between">
        <kbd class="kbc-button kbc-button-dark kbc-button-xs">
          {{ formatKey(kkey) }}
        </kbd>
        <div class="pt-2 mr-1">
          {{ i < keys.length - 1 ? "+" : "" }}
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import "keyboard-css";

export default {
  name: "keyboardbutton",
  data() {
    return {
      keys: this.button.split("+"),
    };
  },
  props: {
    button: {
      type: String,
      default: "null",
    },
  },
  methods: {
    formatKey(key: string) {
      let newKey = key;

      switch (newKey.toLowerCase()) {
        case "arrowup":
          newKey = "↑";
          break;
        case "arrowdown":
          newKey = "↓";
          break;
        case "arrowleft":
          newKey = "←";
          break;
        case "arrowright":
          newKey = "→";
          break;
      }

      return newKey.length === 1 ? newKey.toUpperCase() : key;
    },
  },
};
</script>
