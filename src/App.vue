<template>
  <div id="app">
    <LocalSignaling :connectionsPool="connectionsPool"/>
    <ManualSignaling v-if="showManualConnection" :connectionsPool="connectionsPool"/>
    <button @click="showManualConnection = true">Manual connection</button>
    <SocketsSignaling :connectionsPool="connectionsPool"/>
    <div>Active connections: {{ activeConnectionsNum }}</div>

    <input v-model="input" :disabled="activeConnectionsNum < 1"><button :disabled="activeConnectionsNum < 1" @click="sendMessage">Send</button>
    <div ref="messages"></div>

    <input v-model="url" :disabled="activeConnectionsNum < 1"><button :disabled="activeConnectionsNum < 1" @click="addUrl">Send</button>

    <br>
    Login: <input v-model="login"><br>
    Password: <input v-model="password"><br>
    <div v-if="authenticatedUser">
      User: {{ authenticatedUser.login }} - {{ authenticatedUser.publicKey}} <br>
    </div>
    <button @click="register">Register</button>
    <button @click="signin">Login</button>
    {{ authErrorMessage }}
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import LocalSignaling from './components/LocalSignaling.vue'
import ManualSignaling from './components/ManualSignaling.vue'
import SocketsSignaling from './components/SocketsSignaling.vue'
import { WebRtcConnectionsPool } from 'webrtc-connection'
import { StorageService } from '@/services/StorageService'
import { CryptoService } from '@/services/CryptoService'
import { UserService } from '@/services/UserService'
import { TransactionService } from '@/services/TransactionService'
import { TransactionSerializer } from '@/services/TransactionSerializer'
import { Transport } from '@/services/Transport'
import { Validator } from '@/services/Validator'
import { UrlService } from '@/services/UrlService'
import { AuthenticatedUser } from '@/models/AuthenticatedUser'

@Component({
  components: {
    LocalSignaling,
    ManualSignaling,
    SocketsSignaling
  }
})
export default class App extends Vue {
  private connectionsPool?: WebRtcConnectionsPool
  private activeConnectionsNum: number = 0
  private showManualConnection: boolean = false
  private input = ''
  private url = ''
  private login = ''
  private password = ''
  private authErrorMessage = ''
  private userService?: UserService
  private urlService?: UrlService
  private authenticatedUser?: AuthenticatedUser | null = null
  private storageNamespace: string = 'webrtc_dapp'

  $refs!: {
    messages: HTMLElement
  }

  created () {
    this.connectionsPool = new WebRtcConnectionsPool()
    this.connectionsPool.addOnOpenCallback(() => {
      this.activeConnectionsNum += 1
    })
    this.connectionsPool.addOnCloseCallback(() => {
      this.activeConnectionsNum -= 1
    })
    this.connectionsPool.addOnMessageCallback((message: string, peerId: string) => {
      this.$refs.messages.innerHTML += '<div>' + peerId + ': ' + message + '</div>'
    })

    const cryptoService = new CryptoService()
    const transactionSerializer = new TransactionSerializer()
    const storageService = new StorageService(this.storageNamespace, transactionSerializer)
    const transport = new Transport(this.connectionsPool, transactionSerializer)
    const validator = new Validator(cryptoService)
    const transactionService = new TransactionService(cryptoService, transport, storageService, validator)

    this.userService = new UserService(cryptoService, transactionService)
    this.urlService = new UrlService(transactionService)

    this.$root.$on('manualConnected', () => {
      this.showManualConnection = false
    })
  }

  sendMessage () {
    if (!this.connectionsPool || !this.input) {
      return
    }
    this.connectionsPool.sendMessage(this.input)
    this.input = ''
  }

  addUrl () {
    if (!this.connectionsPool || !this.url || !this.urlService || !this.authenticatedUser) {
      return
    }

    this.urlService.postUrl(this.authenticatedUser, this.url)
    this.url = ''
  }

  register () {
    if (!this.userService) {
      return
    }
    this.authErrorMessage = ''

    try {
      this.authenticatedUser = this.userService.register(this.login, this.password)
    } catch (e) {
      this.authErrorMessage = e.toString()
    }
  }

  signin () {
    if (!this.userService) {
      return
    }
    this.authErrorMessage = ''

    try {
      this.authenticatedUser = this.userService.login(this.login, this.password)
    } catch (e) {
      this.authErrorMessage = e.toString()
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
