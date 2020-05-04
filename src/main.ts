import Vue from 'vue'
import App from './App.vue'
import VModal from 'vue-js-modal'

Vue.config.productionTip = false
Vue.use(VModal, { dialog: true })

const VuePlyr = require('vue-plyr')

Vue.use(VuePlyr.default, {
  plyr: {
    fullscreen: { enabled: false }
  },
  emit: ['ended']
})

require('bootstrap/dist/js/bootstrap.bundle.js')
require('bootstrap/dist/css/bootstrap.css')

new Vue({
  render: h => h(App)
}).$mount('#app')
