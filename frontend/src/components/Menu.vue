<template>
  <h1>{{ counter }}</h1>
  <v-btn @click="increment">+</v-btn>
  <v-btn @click="decrement">-</v-btn>
</template>

<script lang="ts">
export default {
  data() {
    return {
      counter: 0,
    };
  },
  methods: {
    increment() {
      this.counter++;
    },
    decrement() {
      this.counter--;
    },
  },
};
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
