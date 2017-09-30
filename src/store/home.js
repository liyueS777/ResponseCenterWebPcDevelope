import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    avatorurl:'', //用户中心头像地址
    login:null,
    oaId:'',
    remoteConnect:null,
    compId:1,
    PcompId:null,//父级id
    isMobile: navigator.userAgent.toLowerCase().match(/mobile/i) != null,
    webStatus:false,
    popmsg:'',
    isPop:false,
    cusWS:null,
    poptype:null,
  },
  getters:{
    websocket: state => {
      return state.websocket
    }
  },
  mutations: {
    modify(state, data){
      state[data.type] = data.val
    }
  },
  actions:{
    modify({commit},data){
      commit('modify', data)
    }
  }
})
