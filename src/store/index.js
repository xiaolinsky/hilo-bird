/**
 * @author Sky Lin
 * @date 2019/12/9
 */
import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex)
const state = {
  asset: {}
}

export default new Vuex.Store({
  state,
  actions,
  mutations,
  getters
})
