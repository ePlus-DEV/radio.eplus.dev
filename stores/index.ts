import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    player: {},
    player_home: {},
    timezone: "Asia/Ho_Chi_Minh",
  }),
  actions: {
    setPlayer(player: any) {
      this.player = player;
    },
    setPlayerHome(player_home: any) {
      this.player_home = player_home;
    },
    setTimezone(timezone: string) {
      this.timezone = timezone;
    },
  },
  getters: {
    getPlayer(): any {
      return this.player;
    },
    getPlayerHome(): any {
      return this.player_home;
    },
    getTimezone(): string {
      return this.timezone;
    },
  },
});
