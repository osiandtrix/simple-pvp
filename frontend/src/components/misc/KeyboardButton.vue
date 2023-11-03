<template>
  <kbd class="kbc-button kbc-button-dark kbc-button-xs">{{ button }}</kbd>
</template>

<script lang="ts">
import "keyboard-css";

export default {
  name: "keyboardbutton",
  data() {
    return {};
  },
  props: {
    button: {
      type: String,
      default: "null",
    },
  },
};
</script>
