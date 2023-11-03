<template>
  <v-card class="pa-5" height="full">
    <v-card-title>
      <v-row class="py-2">
        <v-col class="pa-0">
          <div class="pt-2 ml-4">Event Log</div>
        </v-col>
        <v-spacer></v-spacer>

        <v-col class="pa-0" cols="1">
          <v-switch hide-details v-model="showEventLog"></v-switch>
        </v-col>
      </v-row>

      <v-card border rounded class="mx-2">
        <v-row class="pa-0 py-5 px-5">
          <div class="indicatorText">
            {{ targetIndex + 1 }}/{{ targets.length }}
          </div>
          <v-tooltip text="Targets" location="top">
            <template v-slot:activator="{ props }">
              <v-icon color="red" v-bind="props">mdi-account-remove</v-icon>
            </template>
          </v-tooltip>

          <v-spacer></v-spacer>

          <div class="indicatorText">
            {{ activeGuildIndex - 1 }}/{{ warlist.length }}
          </div>
          <v-tooltip text="Guilds" location="top">
            <template v-slot:activator="{ props }">
              <v-icon color="brown" v-bind="props">mdi-chess-rook</v-icon>
            </template>
          </v-tooltip>

          <v-spacer></v-spacer>

          <div class="indicatorText">{{ 40 - apiLimit }}</div>
          <v-tooltip :text="`API Limit (${resetIn}s)`" location="top">
            <template v-slot:activator="{ props }">
              <v-icon
                @mouseover="isHovering = true"
                @mouseleave="isHovering = false"
                color="blue"
                v-bind="props"
                >mdi-access-point</v-icon
              >
            </template>
          </v-tooltip>
        </v-row>
      </v-card>

      <v-card
        rounded
        border
        class="px-0 mx-2"
        style="height: 40vh; overflow-y: scroll; font-size: 0.8rem"
      >
        <div
          v-if="showEventLog"
          v-for="(event, i) in events.reverse()"
          :class="mod(i, 2) === 0 ? 'evenElement' : 'oddElement'"
          class="mx-0 px-2"
        >
          <v-row>
            <v-col cols="1">{{ i + 1 }}.</v-col>
            <!-- <v-col cols="1">
              <v-tooltip
                :text="capitalizeFirstLetter(event.type)"
                location="top"
              >
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" :color="getColorForEventIcon(event)">
                    {{ getIconForEvent(event) }}
                  </v-icon>
                </template>
              </v-tooltip>
            </v-col> -->
            <v-col>{{ event.text }}</v-col>
          </v-row>
        </div>
      </v-card>
    </v-card-title>
  </v-card>
</template>

<script lang="ts">
import { mapGetters } from "vuex";

export default {
  name: "eventlog",
  data() {
    return {
      resetIn: 0,
      isHovering: false,
      refreshInterval: null as any,
      showEventLog: false,
    };
  },
  watch: {
    isHovering(val) {
      if (!val) return (this.refreshInterval = null);

      this.refreshInterval = setInterval(this.refreshReset, 100);
    },
  },
  computed: {
    ...mapGetters({
      events: "events/events",

      warlist: "wars/warlist",
      activeGuildIndex: "wars/activeGuildIndex",

      targets: "wars/targets",
      targetIndex: "wars/targetIndex",

      apiLimit: "process/apiLimit",
      apiLimit_Stamp: "process/apiLimit_Stamp",
    }),
  },
  methods: {
    mod(n: number, m: number) {
      return n % m;
    },
    getIconForEvent(event: Event) {
      switch (event.type) {
        case "attack":
          return "mdi-sword";
        default:
          return "mdi-help";
      }
    },
    getColorForEventIcon(event: Event) {
      switch (event.type) {
        case "attack":
          return "red";
        default:
          return "";
      }
    },
    capitalizeFirstLetter(text: string) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
    refreshReset() {
      const now: number = Math.ceil(new Date().getTime() / 1000);
      const newValue: number = 60 - (now - (this.apiLimit_Stamp ?? 0));

      this.resetIn = newValue >= 0 ? newValue : 0;
    },
  },
};
</script>

<style scoped>
.indicatorText {
  font-size: smaller;
  margin-right: 0.5rem;
}
</style>

<style scoped>
.oddElement {
  background-color: rgb(26, 26, 26);
}

.evenElement {
  background-color: rgb(37, 37, 37);
}
</style>
