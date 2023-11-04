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
    </v-card>

    <v-card
      rounded
      border
      class="pa-2 my-2 mx-5"
      style="position: fixed; z-index: 999; top: 15.8rem; width: 95.5vw"
      v-if="remapActive"
    >
      <v-row>
        <v-col cols="3">Remapping: </v-col>
        <v-col cols="1">{{ targetKey }}</v-col>
        <v-col>[ {{ pressedKeys.join("+") }} ]</v-col>
        <v-spacer></v-spacer>
        <v-col cols="2">Esc to cancel</v-col>
      </v-row>
    </v-card>
    <v-card
      :key="forceRefresh"
      rounded
      border
      class="ma-5 px-3"
      style="height: 50vh; overflow-y: scroll; font-size: 0.8rem"
    >
      <v-row id="headers" class="mb-2">
        <v-col class="pl-5" cols="9">Description</v-col>
        <v-col cols="3">Keybind</v-col>
      </v-row>
      <v-row
        class="px-3"
        v-for="(bind, i) of keyBinds"
        :class="mod(i, 2) === 0 ? 'evenElement' : 'oddElement'"
      >
        <v-col class="pa-0 py-2 pt-4" cols="7">{{ bind.description }}</v-col>
        <v-spacer></v-spacer>
        <v-col class="pa-0 py-2">
          <KeyboardButton
            @click="startKeyboardRemap(bind.defaultKey)"
            :button="bind.remapKey ? bind.remapKey : bind.defaultKey"
          />
        </v-col>
      </v-row>
    </v-card>
  </v-main>
</template>

<script lang="ts">
import { mapGetters } from "vuex";
// import Keybind from "../../../../electron/types/Keybind";
import KeyboardButton from "../misc/KeyboardButton.vue";
import axios from "axios";

export default {
  name: "settings",
  data() {
    return {
      apiKey: null,
      // keyBinds: [] as Array<Keybind>,

      remapActive: false,
      targetKey: null as null | string,
      pressedKeys: [] as Array<string>,
      keysUp: 0,

      forceRefresh: 0,
    };
  },
  components: {
    KeyboardButton,
  },
  async mounted() {
    document.addEventListener("keydown", this.onKeyDown);

    const res = await this.$store.dispatch("settings/fetchKeybinds");
    this.keyBinds = res;

    this.apiKey = this.savedAPIKey;
  },
  watch: {
    savedAPIKey(val) {
      this.apiKey = val;
    },
    keyBinds: {
      deep: true,
      handler() {
        this.forceRefresh++;
      },
    },
  },
  computed: {
    ...mapGetters({
      savedAPIKey: "settings/apiKey",
      keyBinds: "settings/keyBinds",
    }),
  },
  methods: {
    mod(n: number, m: number) {
      return n % m;
    },
    startKeyboardRemap(key: string) {
      this.targetKey = key;
      this.remapActive = true;

      document.addEventListener("keydown", this.onKeyDown);
      document.addEventListener("keyup", this.onKeyUp);
    },
    onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") return this.resetKeyboardListenEvent();
      if (this.pressedKeys.includes(event.key)) return;
      if (event.key === " " && this.pressedKeys.includes("Space")) return;

      if (event.key === " ") this.pressedKeys.push("Space");
      else
        this.pressedKeys.push(
          event.key.length === 1 ? event.key.toLowerCase() : event.key
        );
    },
    onKeyUp() {
      this.keysUp++;
      if (this.keysUp < this.pressedKeys.length) return;

      this.submitKeyboardRemap(this.targetKey, this.pressedKeys.join("+"));

      this.resetKeyboardListenEvent();
    },
    async submitKeyboardRemap(key: string | null, remap: string) {
      this.$store.dispatch(
        "settings/newKeybind",
        JSON.parse(JSON.stringify({ remap, key }))
      );

      this.$toast.success("Successfully set new keybind.");
    },
    resetKeyboardListenEvent() {
      this.pressedKeys = [];
      this.keysUp = 0;
      this.targetKey = null;
      this.remapActive = false;

      document.removeEventListener("keydown", this.onKeyDown);
      document.removeEventListener("keyup", this.onKeyUp);
    },
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

<style scoped>
#headers {
  font-size: 1rem;
  background-color: rgb(21, 21, 21);
  text-decoration: underline;

  position: sticky;
  top: 0;
  z-index: 1;
}
.oddElement {
  background-color: rgb(26, 26, 26);
}

.evenElement {
  background-color: rgb(37, 37, 37);
}
</style>
