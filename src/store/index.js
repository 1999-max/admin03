import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from '@/settings'
import user from './modules/user'

import tagsView from './modules/tagsView'
import permission from './modules/permission'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    tagsView,
    permission, // 权限
  },
  getters
})

export default store
