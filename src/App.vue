<template>
  <div id="app">
    <LocalSignaling :connectionsPool="connectionsPool"/>
    <ManualSignaling v-if="showManualConnection" :connectionsPool="connectionsPool"/>
    <button @click="showManualConnection = true">Manual connection</button>
    <SocketsSignaling :connectionsPool="connectionsPool"/>
    <div>Active connections: {{ activeConnectionsNum }}</div>

    <input v-model="input" :disabled="activeConnectionsNum < 1"><button :disabled="activeConnectionsNum < 1" @click="sendMessage">Send</button>
    <div ref="messages" style="height: 100px; overflow: scroll"></div>

    <input v-model="url" :disabled="activeConnectionsNum < 1"><button :disabled="activeConnectionsNum < 1" @click="addUrl">Send</button>

    {{ postUrlErrorMessage }}

    <br>
    Login: <input v-model="login"><br>
    Password: <input v-model="password"><br>
    <div v-if="authenticatedUser">
      User: {{ authenticatedUser.login }} - {{ authenticatedUser.publicKey}} <br>
    </div>
    <button @click="register">Register</button>
    <button @click="signin">Login</button>
    {{ authErrorMessage }}

    <div>
      <posted-urls-list :posted-urls="postedUrls"></posted-urls-list>
    </div>
    <div>
      <users-list :users-with-transactions="usersWithTransactions"></users-list>
    </div>

    <div>
      <ignore-and-block-preferences :preferences-ignore-and-block="preferencesIgnoreAndBlock"></ignore-and-block-preferences>
    </div>

    <v-dialog/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import LocalSignaling from './components/LocalSignaling.vue'
import ManualSignaling from './components/ManualSignaling.vue'
import SocketsSignaling from './components/SocketsSignaling.vue'
import PostedUrlsList from './components/PostedUrlsList.vue'
import { WebRtcConnectionsPool } from 'webrtc-connection'
import { StorageService } from '@/services/StorageService'
import { CryptoService } from '@/services/CryptoService'
import { UserService } from '@/services/UserService'
import { TransactionService } from '@/services/TransactionService'
import { TransactionSerializer } from '@/services/TransactionSerializer'
import { TransportService } from '@/services/TransportService'
import { ValidatorService } from '@/services/ValidatorService'
import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { YouTubeRadio } from '@/app/YouTubeRadio'
import { TransactionTypeResolver } from '@/services/TransactionTypeResolver'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'
import { YouTubeUrlSerializer } from '@/app/transactions/YouTubeUrl/YouTubeUrlSerializer'
import { YouTubeUrlValidator } from '@/app/transactions/YouTubeUrl/YouTubeUrlValidator'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'
import { UserWithTransactions } from '@/models/UserWithTransactions'
import { Transaction } from '@/models/Transaction'
import UsersList from '@/components/UsersList.vue'
import { IgnoreAndBlockFilterService } from '@/services/IgnoreAndBlockFilterService'
import { EventHub } from '@/components/EventHub'
import { User } from '@/models/User'
import { IgnoreAndBlockControlService } from '@/services/IgnoreAndBlockControlService'
import IgnoreAndBlockPreferences from '@/components/IgnoreAndBlockPreferences.vue'
import { PreferencesIgnoreAndBlock } from '@/models/PreferencesIgnoreAndBlock'
import { YouTubeUrlVoteTransactionType } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteTransactionType'
import { YouTubeUrlVoteSerializer } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteSerializer'
import { YouTubeUrlVoteValidator } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteValidator'

@Component({
  components: {
    IgnoreAndBlockPreferences,
    UsersList,
    LocalSignaling,
    ManualSignaling,
    SocketsSignaling,
    PostedUrlsList
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
  private postUrlErrorMessage = ''
  private userService?: UserService
  private ignoreAndBlockControlService?: IgnoreAndBlockControlService
  private youTubeRadio?: YouTubeRadio
  private authenticatedUser?: AuthenticatedUser | null = null
  private storageNamespace: string = 'webrtc_dapp'
  private postedUrls: YouTubeUrlModel[] = []
  private usersWithTransactions: UserWithTransactions[] = []
  private preferencesIgnoreAndBlock?: PreferencesIgnoreAndBlock
  private broadcastInterval = 10000

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
    const transactionTypeResolver = new TransactionTypeResolver()
    transactionTypeResolver.setPayloadSerializer(YouTubeUrlTransactionType.t, new YouTubeUrlSerializer())
    transactionTypeResolver.setSpecificValidator(YouTubeUrlTransactionType.t, new YouTubeUrlValidator())
    transactionTypeResolver.setPayloadSerializer(YouTubeUrlVoteTransactionType.t, new YouTubeUrlVoteSerializer())
    transactionTypeResolver.setSpecificValidator(YouTubeUrlVoteTransactionType.t, new YouTubeUrlVoteValidator())

    const transactionSerializer = new TransactionSerializer(transactionTypeResolver)
    const storageService = new StorageService(this.storageNamespace, transactionSerializer)
    const transportService = new TransportService(this.connectionsPool, transactionSerializer)
    const validatorService = new ValidatorService(cryptoService, transactionTypeResolver)
    const ignoreAndBlockFilterService = new IgnoreAndBlockFilterService(storageService)
    const transactionService = new TransactionService(
      cryptoService,
      transportService,
      storageService,
      validatorService,
      ignoreAndBlockFilterService,
      5
    )

    this.userService = new UserService(cryptoService, transactionService)
    this.ignoreAndBlockControlService = new IgnoreAndBlockControlService(storageService)
    this.youTubeRadio = new YouTubeRadio(transactionService, this.userService)
    this.youTubeRadio.addOnNewPostedUrlsCallback(this.handleNewPostedUrls)

    transactionService.addOnNewTransactionsCallback(this.handleNewTransactions)

    let broadcastIntervalId: number
    this.connectionsPool.addOnOpenCallback(() => {
      if (!broadcastIntervalId) {
        broadcastIntervalId = window.setInterval(() => {
          transactionService.broadcastTransactions()
        }, this.broadcastInterval)
      }
    })

    this.loadModels()

    this.$root.$on('manualConnected', () => {
      this.showManualConnection = false
    })

    EventHub.$on('userControl', (action: string, user: User) => {
      if (!this.ignoreAndBlockControlService) {
        return
      }

      switch (action) {
        case 'block':
          this.ignoreAndBlockControlService.addUserToBlockBlackList(user)
          break
        case 'ignore':
          this.ignoreAndBlockControlService.addUserToIgnoreBlackList(user)
          break
        case 'addToBlockWhiteList':
          this.ignoreAndBlockControlService.addUserToBlockWhiteList(user)
          break
        case 'addToIgnoreWhiteList':
          this.ignoreAndBlockControlService.addUserToIgnoreWhiteList(user)
          break
        case 'removeFromBlockBlackList':
          this.ignoreAndBlockControlService.removeUserFromBlockBlackList(user)
          break
        case 'removeFromIgnoreBlackList':
          this.ignoreAndBlockControlService.removeUserFromIgnoreBlackList(user)
          break
        case 'removeFromBlockWhiteList':
          this.ignoreAndBlockControlService.removeUserFromBlockWhiteList(user)
          break
        case 'removeFromIgnoreWhiteList':
          this.ignoreAndBlockControlService.removeUserFromIgnoreWhiteList(user)
          break
        default:
          console.error('Unknown userControl action', action)
      }

      transactionService.filterAndStoreStoredTransactions()
      this.loadModels()
    })

    EventHub.$on('setIgnoreAndBlockListEnabled', (list: string, value: boolean) => {
      if (!this.ignoreAndBlockControlService) {
        return
      }

      switch (list) {
        case 'blockBlack':
          this.ignoreAndBlockControlService.setBlockBlackListEnabled(value)
          break
        case 'ignoreBlack':
          this.ignoreAndBlockControlService.setIgnoreBlackListEnabled(value)
          break
        case 'blockWhite':
          this.ignoreAndBlockControlService.setBlockWhiteListEnabled(value)
          break
        case 'ignoreWhite':
          this.ignoreAndBlockControlService.setIgnoreWhiteListEnabled(value)
          break
        default:
          console.error('Unknown setIgnoreAndBlockListEnabled list', list)
      }

      transactionService.filterAndStoreStoredTransactions()
      this.loadModels()
    })

    EventHub.$on('vote', (urlModel: YouTubeUrlModel, isPositive: boolean) => {
      if (!this.youTubeRadio || !this.authenticatedUser) {
        return
      }

      this.youTubeRadio.vote(this.authenticatedUser, urlModel, isPositive)

      this.loadModels()
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
    if (!this.connectionsPool || !this.url || !this.youTubeRadio || !this.authenticatedUser) {
      return
    }
    this.postUrlErrorMessage = ''

    try {
      this.youTubeRadio.postUrl(this.authenticatedUser, this.url)
      this.url = ''
    } catch (e) {
      this.postUrlErrorMessage = e.toString()
    }
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

  handleNewPostedUrls (postedUrls: YouTubeUrlModel[]) {
    console.log('new urls', postedUrls)
    this.postedUrls = this.postedUrls.concat(postedUrls)
  }

  handleNewTransactions (newTransactions: Transaction[]) {
    if (this.userService) {
      this.usersWithTransactions = this.userService.getUsersWithTransactions(true)
    }
  }

  loadModels () {
    if (this.youTubeRadio) {
      this.postedUrls = this.youTubeRadio.getPostedUrls()
    }
    if (this.userService) {
      this.usersWithTransactions = this.userService.getUsersWithTransactions(true)
    }
    if (this.ignoreAndBlockControlService) {
      this.preferencesIgnoreAndBlock = this.ignoreAndBlockControlService.getPreferences()
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
