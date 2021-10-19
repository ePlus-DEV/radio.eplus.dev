// Enable store for auth module
export const state = () => ({
  vietnam: {}
});

export const mutations = {
  STORE_VIETNAM(state, data) {
    state.vietnam = data;
  }
};

export const actions = {
  storeVN({ commit }, data) {
    commit("STORE_VIETNAM", data);
  }
};

export const getters = {
  getVN(state) {
    return state.vietnam;
  }
};
