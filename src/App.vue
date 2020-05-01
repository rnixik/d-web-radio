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

    <button @click="stressTest">Start stress test</button>

    <div v-if="playerVideoId" style="width: 640px;">
      <player :video-id="playerVideoId" :playlist="playlist"></player>
    </div>

    <div id="validator-player-container" style="display: none;"></div>

    <div style="height: 200px; overflow: scroll">
      <h2>Latest posted urls</h2>
      <posted-urls-list :posted-urls="postedUrls" :user="authenticatedUser" list-id="latest"></posted-urls-list>
    </div>
    <div style="height: 200px; overflow: scroll">
      <h2>Top posted urls</h2>
      <posted-urls-list :posted-urls="postedUrlsTop" :user="authenticatedUser" list-id="top"></posted-urls-list>
    </div>
    <div>
      <users-list :users-with-transactions="usersWithTransactions"></users-list>
    </div>

    <div>
      <ignore-and-block-preferences :preferences-ignore-and-block="preferencesIgnoreAndBlock"></ignore-and-block-preferences>
    </div>

    <div>Used storage space: {{ (this.usedStorageSpace / 1024 / 1024).toFixed(2) }} MB</div>

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
import { PostedUrl } from '@/app/models/PostedUrl'
import Player from '@/components/Player.vue'

@Component({
  components: {
    Player,
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
  private postedUrls: PostedUrl[] = []
  private postedUrlsTop: PostedUrl[] = []
  private usersWithTransactions: UserWithTransactions[] = []
  private preferencesIgnoreAndBlock?: PreferencesIgnoreAndBlock
  private broadcastInterval = 30000
  private usedStorageSpace = 0
  private playerVideoId: string | null = null
  private playlist: string[] = []
  private playingListId: string = ''

  $refs!: {
    messages: HTMLElement
  }

  created () {
    this.connectionsPool = new WebRtcConnectionsPool(true)
    this.connectionsPool.addOnOpenCallback(() => {
      this.activeConnectionsNum += 1
    })
    this.connectionsPool.addOnCloseCallback(() => {
      this.activeConnectionsNum -= 1
    })

    const youTubeUrlValidator = new YouTubeUrlValidator()
    youTubeUrlValidator.maxVideoDuration = 300

    const transactionTypeResolver = new TransactionTypeResolver()
    transactionTypeResolver.setPayloadSerializer(YouTubeUrlTransactionType.t, new YouTubeUrlSerializer())
    transactionTypeResolver.setSpecificValidator(YouTubeUrlTransactionType.t, youTubeUrlValidator)
    transactionTypeResolver.setPayloadSerializer(YouTubeUrlVoteTransactionType.t, new YouTubeUrlVoteSerializer())
    transactionTypeResolver.setSpecificValidator(YouTubeUrlVoteTransactionType.t, new YouTubeUrlVoteValidator())

    const cryptoService = new CryptoService(transactionTypeResolver)
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

    this.usedStorageSpace = storageService.getUsedStorageSpace()

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

    EventHub.$on('vote', (urlModel: PostedUrl, isPositive: boolean) => {
      if (!this.youTubeRadio || !this.authenticatedUser) {
        return
      }

      this.youTubeRadio.vote(this.authenticatedUser, urlModel, isPositive)

      this.loadModels()
    })

    EventHub.$on('play', (postedUrl: PostedUrl, listId: string) => {
      this.playerVideoId = postedUrl.urlModel.videoId
      this.playingListId = listId
      this.updatePlaylist()
    })
  }

  sendMessage () {
    if (!this.connectionsPool || !this.input) {
      return
    }
    this.connectionsPool.sendMessage(this.input)
    this.input = ''
  }

  async addUrl () {
    if (!this.connectionsPool || !this.url || !this.youTubeRadio || !this.authenticatedUser) {
      return
    }
    this.postUrlErrorMessage = ''

    try {
      await this.youTubeRadio.postUrl(this.authenticatedUser, this.url)
      this.url = ''
    } catch (e) {
      console.error(e)
      this.postUrlErrorMessage = e.toString()
    }
  }

  async register () {
    if (!this.userService) {
      return
    }
    this.authErrorMessage = ''

    try {
      this.authenticatedUser = await this.userService.register(this.login, this.password)
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

  handleNewPostedUrls (postedUrls: PostedUrl[]) {
    if (!this.youTubeRadio) {
      return
    }
    this.postedUrls = this.youTubeRadio.getPostedUrls(true)
    this.postedUrlsTop = this.youTubeRadio.getPostedUrls(false)
  }

  handleNewTransactions (newTransactions: Transaction[]) {
    if (this.userService) {
      this.usersWithTransactions = this.userService.getUsersWithTransactions(true)
    }
  }

  loadModels () {
    if (this.youTubeRadio) {
      this.postedUrls = this.youTubeRadio.getPostedUrls(true)
      this.postedUrlsTop = this.youTubeRadio.getPostedUrls(false)
      this.updatePlaylist()
    }
    if (this.userService) {
      this.usersWithTransactions = this.userService.getUsersWithTransactions(true)
    }
    if (this.ignoreAndBlockControlService) {
      this.preferencesIgnoreAndBlock = this.ignoreAndBlockControlService.getPreferences()
    }
  }

  updatePlaylist () {
    if (this.playingListId === 'top') {
      this.playlist = this.postedUrlsTop.map((url: PostedUrl) => url.urlModel.videoId)
    } else {
      this.playlist = this.postedUrls.map((url: PostedUrl) => url.urlModel.videoId)
    }
  }

  stressTest () {
    if (this.youTubeRadio && this.authenticatedUser) {
      for (let i = 1000; i < 1999; i++) {
        const url = 'https://www.youtube.com/watch?v=1234567' + i
        this.youTubeRadio.postUrl(this.authenticatedUser, url)
      }
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
