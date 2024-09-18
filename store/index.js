import world from "~/static/assets/radio/world.json";

// Enable store for auth module
export const state = () => ({
  player: {},
  player_home: {},
  timezone: "Asia/Ho_Chi_Minh",
});

export const mutations = {
  STORE_PLAYER(appState, data) {
    appState.player = data;
  },

  STORE_PLAYER_HOME(appState, data) {
    appState.player_home = data;
  },

  STORE_TIMEZONE(appState, timezone) {
    appState.timezone = timezone;
  },
};

export const actions = {
  storePLAYER({ commit }, data) {
    commit("STORE_PLAYER", data);
  },

  storePLAYERHOME({ commit }, data) {
    commit("STORE_PLAYER_HOME", data);
  },

  storeTIMEZONE({ commit }, { area, country }) {
    const timezone = world[area]?.[country]?.timezone || "Asia/Ho_Chi_Minh";
    commit("STORE_TIMEZONE", timezone);
  },
};

export const getters = {
  getPLAYER(appState) {
    return appState.player;
  },

  getPLAYERHOME(appState) {
    return appState.player_home;
  },

  getTIMEZONE(appState) {
    return appState.timezone;
  },
};
