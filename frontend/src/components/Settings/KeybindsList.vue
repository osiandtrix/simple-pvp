<template>
  <KeyboardButton v-for="bind of keybinds" :button="bind" />
</template>

<script lang="ts">
import KeyboardButton from "../misc/KeyboardButton.vue";

export default {
  name: "keybindslist",
  data() {
    return {
      keybinds: [],
    };
  },
  components: {
    KeyboardButton,
  },
  mounted() {
    this.fetchKeybinds();
  },
  methods: {
    async fetchKeybinds() {
      this.keybinds = await this.$store.dispatch("process/fetchKeybinds");
    },
  },
};
</script>
