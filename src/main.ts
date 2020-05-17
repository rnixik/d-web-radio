import Vue from 'vue'
import App from './App.vue'
import VModal from 'vue-js-modal'
import VueRouter from 'vue-router'
import Greeting from '@/components/pages/Greeting.vue'
import Namespace from '@/components/pages/Namespace.vue'
import Connections from '@/components/pages/Connections.vue'
import Radio from '@/components/pages/Radio.vue'
import Top from '@/components/pages/Top.vue'

Vue.use(VueRouter)

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

const routes = [
  {
    path: '/',
    component: Greeting,
    name: 'greeting'
  },
  {
    path: '/n/:namespace',
    component: Namespace,
    name: 'namespace',
    props: true,
    children: [
      {
        path: 'connections',
        component: Connections,
        name: 'connections'
      },
      {
        path: 'radio',
        component: Radio,
        name: 'radio'
      },
      {
        path: 'top',
        component: Top,
        name: 'top'
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
