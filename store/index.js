// Enable store for auth module
export const state = () => ({
  player: {}
});

export const mutations = {
  STORE_PLAYER(state, data) {
    state.player = data;
  }
};

export const actions = {
  storePLAYER({ commit }, data) {
    commit("STORE_PLAYER", data);
  }
};

export const getters = {
  getPLAYER(state) {
    return state.player;
  }
};
