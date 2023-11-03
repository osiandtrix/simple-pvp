<template>
  <v-card class="pa-5" height="full">
    <v-row class="my-2" v-if="!keySet">
      <v-spacer></v-spacer>
      You need to set an API key
    </v-row>
    <v-card-title>
      <v-row class="py-2">
        <div>Warlist</div>
        <v-spacer></v-spacer>

        <v-btn
          icon
          :disabled="!keySet || !warlist || warlist.length <= 0"
          @click="shuffleWars"
        >
          <v-icon>mdi-shuffle-variant</v-icon>
          <v-tooltip activator="parent" location="top">
            Shuffle Wars
          </v-tooltip>
        </v-btn>

        <v-btn icon class="mx-2" :disabled="!keySet" @click="updateWarData">
          <v-icon>mdi-shield-refresh-outline</v-icon>
          <v-tooltip activator="parent" location="top">
            Update War Data
          </v-tooltip>
        </v-btn>
      </v-row>

      <v-card
        rounded
        border
        class="ma-2 px-3"
        style="height: 40vh; overflow-y: scroll; font-size: 0.8rem"
      >
        <v-row id="headers" class="mb-6">
          <v-col cols="8">Name</v-col>
          <v-col cols="2">You</v-col>
          <v-col cols="2">Them</v-col>
        </v-row>
        <div id="wartable" v-for="(war, i) in warlist">
          <v-row
            :class="mod(i, 2) === 0 ? 'evenElement' : 'oddElement'"
            v-if="guildId === war.guild_1.id"
          >
            <v-col cols="8">
              {{ war.guild_2.name }}
            </v-col>
            <v-col cols="2" class="ownKills">
              {{ war.guild_1.kills }}
            </v-col>
            <v-col cols="2" class="targetKills">
              {{ war.guild_2.kills }}
            </v-col>
          </v-row>

          <v-row
            :class="mod(i, 2) === 0 ? 'evenElement' : 'oddElement'"
            v-if="guildId === war.guild_2.id"
          >
            <v-col cols="8">
              {{ war.guild_1.name }}
            </v-col>
            <v-col cols="2" class="ownKills">
              {{ war.guild_2.kills }}
            </v-col>
            <v-col cols="2" class="targetKills">
              {{ war.guild_1.kills }}
            </v-col>
          </v-row>
        </div>
      </v-card>
    </v-card-title>
  </v-card>
</template>

<script lang="ts">
export default {
  name: "warlist",
  data() {
    return {
      headers: [
        { text: "Name", value: "name" },
        { text: "Enemy", value: "enemy" },
        { text: "You", value: "you" },
      ] as Array<any>,
    };
  },
  computed: {
    warlist() {
      return this.$store.getters["wars/warlist"];
    },
    guildId() {
      return this.$store.getters["user/guildId"];
    },
  },
  mounted() {},
  methods: {
    showAPILimitError() {
      const secondsTillReset: number =
        60 -
        (Math.floor(new Date().getTime() / 1000) -
          this.$store.getters["process/apiLimit_Stamp"]);

      this.$toast.error(
        `You have reached the API Limit. Try again in ${secondsTillReset}s`
      );
    },
    mod(a: number, b: number) {
      return a % b;
    },
    sort(param: string) {
      this.warlist.sort((a: any, b: any) => a[param].localeCompare(b[param]));
    },
    async updateWarData() {
      if (this.$store.getters["process/apiLimit"] >= 40)
        return this.showAPILimitError();

      const options = {
        apiKey: this.$store.getters["settings/apiKey"],
        guildId: this.$store.getters["user/guildId"],
      };

      const newWarlist = await this.$store.dispatch("wars/updateWars", options);
      if (!newWarlist || newWarlist.length === 0)
        return this.$toast.error("You have no active wars.");

      this.warlist = JSON.parse(JSON.stringify(newWarlist));
    },
    async shuffleWars() {
      await this.$store.dispatch("wars/shuffleWars");

      this.$store.dispatch(
        "wars/overwriteWarlist",
        JSON.parse(JSON.stringify(this.warlist))
      );
    },
  },
  props: {
    keySet: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style>
#headers {
  font-size: 1rem;
  background-color: rgb(21, 21, 21);
  text-decoration: underline;

  position: sticky;
  top: 0;
  z-index: 1;
}

.ownKills {
  color: rgb(0, 168, 0);
}

.targetKills {
  color: rgb(255, 22, 22);
}

.oddElement {
  background-color: rgb(26, 26, 26);
}

.evenElement {
  background-color: rgb(37, 37, 37);
}

#wartable .v-col {
  height: 3rem;
  padding-top: 0;
  padding-bottom: 0;
}

/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #292929;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgb(26, 26, 26);
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #444444;
}
</style>
