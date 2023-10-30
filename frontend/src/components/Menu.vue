<template>
  <div>
    <v-row>
      <v-spacer></v-spacer>
      <h1 class="mt-2">WELCOME</h1>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <h1>{{ counter }}</h1>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <v-spacer></v-spacer>
      <v-btn @click="decrement">-</v-btn>
      <v-btn @click="increment">+</v-btn>
      <v-spacer></v-spacer>
    </v-row>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {};
  },
  computed: {
    counter(): number {
      return this.$store.getters["counter"];
    },
  },
  methods: {
    increment() {
      this.$store.dispatch("updateCounter", this.counter + 1);
    },
    decrement() {
      this.$store.dispatch("updateCounter", this.counter - 1);
    },
  },
};
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
