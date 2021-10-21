// Enable store for auth module
export const state = () => ({
  player: {},
  player_home: {}
});

export const mutations = {
  STORE_PLAYER(state, data) {
    state.player = data;
  },

  STORE_PLAYER_HOME(state, data) {
    state.player_home = data;
  }
};

export const actions = {
  storePLAYER({ commit }, data) {
    commit("STORE_PLAYER", data);
  },

  storePLAYERHOME({ commit }, data) {
    commit("STORE_PLAYER_HOME", data);
  }
};

export const getters = {
  getPLAYER(state) {
    return state.player;
  },

  getPLAYERHOME(state) {
    return state.player_home;
  }
};
