import countries from '~/static/assets/radio/countries.json';

// Enable store for auth module
export const state = () => ({
  player: {},
  player_home: {},
  timezone: "Asia/Ho_Chi_Minh"
});

export const mutations = {
  STORE_PLAYER(state, data) {
    state.player = data;
  },

  STORE_PLAYER_HOME(state, data) {
    state.player_home = data;
  },

  STORE_TIMEZONE(state, timezone) {
    state.timezone = timezone;
  }
};

export const actions = {
  storePLAYER({ commit }, data) {
    commit("STORE_PLAYER", data);
  },

  storePLAYERHOME({ commit }, data) {
    commit("STORE_PLAYER_HOME", data);
  },

  storeTIMEZONE({ commit }, { area, country }) {
    commit("STORE_TIMEZONE", countries[area][country].timezone);
  }
};

export const getters = {
  getPLAYER(state) {
    return state.player;
  },

  getPLAYERHOME(state) {
    return state.player_home;
  },

  getTIMEZONE(state) {
    return state.timezone;
  }
};
