<template>
  <v-main>
    <v-card class="pa-5">
      <v-card-title>Settings</v-card-title>

      <div>
        <v-text-field
          class="mx-3"
          label="API Key"
          clearable
          append-inner-icon="mdi-key"
          v-model="apiKey"
          variant="solo"
        ></v-text-field>
      </div>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="saveAPIKey" variant="outlined" color="green">
          Save
        </v-btn>
      </v-card-actions>

      <KeyboardButton button="1test" />
    </v-card>
  </v-main>
</template>

<script lang="ts">
import KeyboardButton from "../misc/KeyboardButton.vue";
import axios from "axios";

export default {
  name: "settings",
  data() {
    return {
      apiKey: null,
    };
  },
  components: {
    KeyboardButton,
  },
  mounted() {
    this.apiKey = this.savedAPIKey;
  },
  watch: {
    savedAPIKey(val) {
      this.apiKey = val;
    },
  },
  computed: {
    savedAPIKey() {
      return this.$store.getters["settings/apiKey"];
    },
  },
  methods: {
    async saveAPIKey() {
      const url = `https://api.simple-mmo.com/v1/player/me`;
      const res = await axios
        .post(url, { api_key: this.apiKey })
        .catch(() => ({ status: 500, data: null }));

      if (res.status !== 200) return this.$toast.error("Invalid API Key");

      const { id } = res.data;
      const { id: guildId } = res.data.guild;

      this.$store.dispatch("user/setUserId", {
        userId: id,
      });

      this.$store.dispatch("user/setGuildId", {
        guildId: guildId,
      });

      this.$store.dispatch("settings/saveAPIKey", {
        api_key: this.apiKey,
      });

      this.$toast.success("API Key saved successfully");
    },
  },
};
</script>
