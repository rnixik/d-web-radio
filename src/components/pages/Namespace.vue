<template>
  <div>
    <div class="page-wrapper chiller-theme toggled">
      <a id="show-sidebar" class="btn btn-sm btn-dark" href="#">
        <i class="fas fa-bars"></i>
      </a>
      <nav id="sidebar" class="sidebar-wrapper">
        <div class="sidebar-content">
          <div class="sidebar-brand">
            <a href="#">{{ namespace }}</a>
            <div id="close-sidebar">
              <i class="fas fa-times"></i>
            </div>
          </div>
          <div class="sidebar-header" v-if="authenticatedUser">
            <div class="user-pic">
              <span v-html="identicon"></span>
            </div>
            <div class="user-info">
              <span class="user-name">
                {{ authenticatedUser.login }}
              </span>
              <span class="user-role" :title="authenticatedUser.publicKey">
                {{ authenticatedUser.publicKey.substr(0, 8) }}...{{ authenticatedUser.publicKey.substr(-8) }}
              </span>
              <span class="user-status"></span>
            </div>
          </div>
          <!-- sidebar-header  -->

          <div class="sidebar-menu">
            <ul>
              <li>
                <router-link to="connections">
                  <span>Connections</span>
                  <span
                    class="badge badge-pill"
                    v-bind:class="activeConnectionsNum > 0 ? 'badge-success' : 'badge-danger'">
                    {{ activeConnectionsNum }}
                  </span>
                </router-link>
              </li>
              <li>
                <router-link to="radio">
                  <span>Radio</span>
                </router-link>
              </li>
              <li>
                <router-link to="top">
                  <span>Top-100</span>
                </router-link>
              </li>
            </ul>
          </div>
          <!-- sidebar-menu  -->
        </div>
        <!-- sidebar-content  -->
      </nav>
      <!-- sidebar-wrapper  -->
      <main class="page-content">
        <div class="container-fluid">
          <transition name="slide-up">
            <div v-if="playerVideoId" style="width: 640px;">
              <player :video-id="playerVideoId" :playlist="playlist"></player>
            </div>
          </transition>

          <router-view
            :connectionsPool="connectionsPool"
            :postedUrls="postedUrls"
            :postedUrlsTop="postedUrlsTop"
            :authenticatedUser="authenticatedUser"
          ></router-view>

          Add video (link to YouTube): <input v-model="url" :disabled="activeConnectionsNum < 1"><button :disabled="activeConnectionsNum < 1" @click="addUrl">Send</button>

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

          <label>
            <input type="checkbox" v-model="doNotAddToPlaylistDownVoted"> Do not add down-voted urls to playlist
          </label>

          <div id="validator-player-container" style="display: none;"></div>

          <div style="height: 200px; overflow: scroll">
            <h2>Top posted urls</h2>
            <posted-urls-list :posted-urls="postedUrlsTop" :user="authenticatedUser" list-id="top"></posted-urls-list>
          </div>

          <div v-if="myTransactions && authenticatedUser">
            <my-transactions :transactions="myTransactions"></my-transactions>
          </div>

          <div>
            <users-list :users-with-transactions="usersWithTransactions"></users-list>
          </div>

          <div v-if="preferencesIgnoreAndBlock">
            <ignore-and-block-preferences :preferences-ignore-and-block="preferencesIgnoreAndBlock"></ignore-and-block-preferences>
          </div>

          <div>Used storage space: {{ (this.usedStorageSpace / 1024 / 1024).toFixed(2) }} MB</div>

          <v-dialog/>
        </div>
      </main>
      <!-- page-content" -->
    </div>
    <!-- page-wrapper -->
  </div>
</template>

<style scoped>
  .slide-up-enter-active, .slide-up-leave-active {
    transition: all 1s;
  }
  .slide-up-enter, .slide-up-leave-to {
    opacity: 0;
    transform: translateY(60px);
  }
</style>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import LocalSignaling from '@/components/LocalSignaling.vue'
import ManualSignaling from '@/components/ManualSignaling.vue'
import SocketsSignaling from '@/components/SocketsSignaling.vue'
import PostedUrlsList from '@/components/PostedUrlsList.vue'
import { WebRtcConnectionsPool } from 'webrtc-connection'
import { AuthenticatedUser } from 'd-web-core/lib/models/AuthenticatedUser'
import { YouTubeRadio } from '@/app/YouTubeRadio'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'
import { YouTubeUrlSerializer } from '@/app/transactions/YouTubeUrl/YouTubeUrlSerializer'
import { YouTubeUrlValidator } from '@/app/transactions/YouTubeUrl/YouTubeUrlValidator'
import { UserWithTransactions } from 'd-web-core/lib/models/UserWithTransactions'
import { Transaction } from 'd-web-core/lib/models/Transaction'
import UsersList from '@/components/UsersList.vue'
import { EventHub } from '@/components/EventHub'
import { User } from 'd-web-core/lib/models/User'
import IgnoreAndBlockPreferences from '@/components/IgnoreAndBlockPreferences.vue'
import { PreferencesIgnoreAndBlock } from 'd-web-core/lib/models/PreferencesIgnoreAndBlock'
import { YouTubeUrlVoteTransactionType } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteTransactionType'
import { YouTubeUrlVoteSerializer } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteSerializer'
import { YouTubeUrlVoteValidator } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteValidator'
import { PostedUrl } from '@/app/models/PostedUrl'
import Player from '@/components/Player.vue'
import MyTransactions from '@/components/MyTransactions.vue'
import { RegularDecentralizedApplication } from 'd-web-core/lib/RegularDecentralizedApplication'

require('@/assets/sidebar.css')

@Component({
  components: {
    MyTransactions,
    Player,
    IgnoreAndBlockPreferences,
    UsersList,
    LocalSignaling,
    ManualSignaling,
    SocketsSignaling,
    PostedUrlsList
  }
})
export default class Namespace extends Vue {
  private namespace = ''
  private connectionsPool: WebRtcConnectionsPool | null = null
  private activeConnectionsNum: number = 0
  private showManualConnection: boolean = false
  private url = ''
  private login = ''
  private password = ''
  private authErrorMessage = ''
  private postUrlErrorMessage = ''
  private youTubeRadio?: YouTubeRadio
  private authenticatedUser?: AuthenticatedUser | null = null
  private postedUrls: PostedUrl[] = []
  private postedUrlsTop: PostedUrl[] = []
  private usersWithTransactions: UserWithTransactions[] = []
  private myTransactions: Transaction[] = []
  private preferencesIgnoreAndBlock: PreferencesIgnoreAndBlock | null = null
  private broadcastInterval = 30000
  private usedStorageSpace = 0
  private playerVideoId: string | null = null
  private playlist: string[] = []
  private playingListId: string = ''
  private doNotAddToPlaylistDownVoted = true
  private dApp?: RegularDecentralizedApplication

  created () {
    this.$root.$on('manualConnected', () => {
      this.showManualConnection = false
    })

    EventHub.$on('userControl', (action: string, user: User) => {
      if (!this.dApp) {
        return
      }

      switch (action) {
        case 'block':
          this.dApp.ignoreAndBlockControlService.addUserToBlockBlackList(user)
          break
        case 'ignore':
          this.dApp.ignoreAndBlockControlService.addUserToIgnoreBlackList(user)
          break
        case 'addToBlockWhiteList':
          this.dApp.ignoreAndBlockControlService.addUserToBlockWhiteList(user)
          break
        case 'addToIgnoreWhiteList':
          this.dApp.ignoreAndBlockControlService.addUserToIgnoreWhiteList(user)
          break
        case 'removeFromBlockBlackList':
          this.dApp.ignoreAndBlockControlService.removeUserFromBlockBlackList(user)
          break
        case 'removeFromIgnoreBlackList':
          this.dApp.ignoreAndBlockControlService.removeUserFromIgnoreBlackList(user)
          break
        case 'removeFromBlockWhiteList':
          this.dApp.ignoreAndBlockControlService.removeUserFromBlockWhiteList(user)
          break
        case 'removeFromIgnoreWhiteList':
          this.dApp.ignoreAndBlockControlService.removeUserFromIgnoreWhiteList(user)
          break
        default:
          console.error('Unknown userControl action', action)
      }

      if (this.dApp) {
        this.dApp.transactionService.filterAndStoreStoredTransactions()
        this.loadModels()
      }
    })

    EventHub.$on('setIgnoreAndBlockListEnabled', (list: string, value: boolean) => {
      if (!this.dApp) {
        return
      }

      switch (list) {
        case 'blockBlack':
          this.dApp.ignoreAndBlockControlService.setBlockBlackListEnabled(value)
          break
        case 'ignoreBlack':
          this.dApp.ignoreAndBlockControlService.setIgnoreBlackListEnabled(value)
          break
        case 'blockWhite':
          this.dApp.ignoreAndBlockControlService.setBlockWhiteListEnabled(value)
          break
        case 'ignoreWhite':
          this.dApp.ignoreAndBlockControlService.setIgnoreWhiteListEnabled(value)
          break
        default:
          console.error('Unknown setIgnoreAndBlockListEnabled list', list)
      }

      if (this.dApp) {
        this.dApp.transactionService.filterAndStoreStoredTransactions()
        this.loadModels()
      }
    })

    EventHub.$on('vote', async (urlModel: PostedUrl, isPositive: boolean) => {
      if (!this.youTubeRadio || !this.authenticatedUser) {
        return
      }

      await this.youTubeRadio.vote(this.authenticatedUser, urlModel, isPositive)

      this.loadModels()
    })

    EventHub.$on('play', (postedUrl: PostedUrl, listId: string) => {
      this.playerVideoId = postedUrl.urlModel.videoId
      this.playingListId = listId
      this.updatePlaylist()
    })
  }

  @Watch('$route', { immediate: true, deep: true })
  beginWithNamespace () {
    if (this.namespace === this.$route.params.namespace) {
      return
    }
    this.namespace = this.$route.params.namespace
    this.connectionsPool = new WebRtcConnectionsPool(true)
    this.connectionsPool.addOnOpenCallback(() => {
      this.activeConnectionsNum += 1
    })
    this.connectionsPool.addOnCloseCallback(() => {
      this.activeConnectionsNum -= 1
    })

    const youTubeUrlValidator = new YouTubeUrlValidator()
    youTubeUrlValidator.maxVideoDuration = 300

    this.dApp = new RegularDecentralizedApplication(this.namespace, this.connectionsPool)
    this.dApp.transactionTypeResolver.setPayloadSerializer(YouTubeUrlTransactionType.t, new YouTubeUrlSerializer())
    this.dApp.transactionTypeResolver.setSpecificValidator(YouTubeUrlTransactionType.t, youTubeUrlValidator)
    this.dApp.transactionTypeResolver.setPayloadSerializer(YouTubeUrlVoteTransactionType.t, new YouTubeUrlVoteSerializer())
    this.dApp.transactionTypeResolver.setSpecificValidator(YouTubeUrlVoteTransactionType.t, new YouTubeUrlVoteValidator())

    this.youTubeRadio = new YouTubeRadio(this.dApp.transactionService, this.dApp.userService)
    this.youTubeRadio.addOnNewPostedUrlsCallback(this.handleNewPostedUrls)

    const dApp = this.dApp
    this.connectionsPool.addOnOpenCallback(() => {
      dApp.startNetworking(this.handleNewTransactions, this.broadcastInterval)
    })

    this.usedStorageSpace = this.dApp.storageService.getUsedStorageSpace()

    this.loadModels()
  }

  get identicon () {
    if (!this.authenticatedUser) {
      return ''
    }
    const jdenticon = require('jdenticon')
    return jdenticon.toSvg(this.authenticatedUser.publicKey, 56)
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
    if (!this.dApp) {
      return
    }
    this.authErrorMessage = ''

    try {
      this.authenticatedUser = await this.dApp.userService.register(this.login, this.password)
    } catch (e) {
      this.authErrorMessage = e.toString()
    }
  }

  async signin () {
    if (!this.dApp) {
      return
    }
    this.authErrorMessage = ''

    try {
      this.authenticatedUser = await this.dApp.userService.login(this.login, this.password)
      await this.loadModels()
    } catch (e) {
      this.authErrorMessage = e.toString()
    }
  }

  async handleNewPostedUrls () {
    if (!this.youTubeRadio) {
      return
    }
    this.postedUrls = await this.youTubeRadio.getPostedUrls(true)
    this.postedUrlsTop = await this.youTubeRadio.getPostedUrls(false)
  }

  async handleNewTransactions (newTransactions: Transaction[]) {
    if (this.dApp) {
      this.usersWithTransactions = await this.dApp.userService.getUsersWithTransactions(true)
    }
  }

  async loadModels () {
    if (this.youTubeRadio) {
      this.postedUrls = await this.youTubeRadio.getPostedUrls(true)
      this.postedUrlsTop = await this.youTubeRadio.getPostedUrls(false)
      this.updatePlaylist()
    }
    if (this.dApp) {
      this.usersWithTransactions = await this.dApp.userService.getUsersWithTransactions(true)
      if (this.authenticatedUser) {
        for (const uwt of this.usersWithTransactions) {
          if (uwt.user.publicKey === this.authenticatedUser.publicKey) {
            this.myTransactions = uwt.transactions
            break
          }
        }
      }
    }
    if (this.dApp) {
      this.preferencesIgnoreAndBlock = await this.dApp.ignoreAndBlockControlService.getPreferences()
    }
  }

  @Watch('doNotAddToPlaylistDownVoted')
  updatePlaylist () {
    let list = this.postedUrls
    if (this.playingListId === 'top') {
      list = this.postedUrlsTop
    }

    if (this.authenticatedUser && this.doNotAddToPlaylistDownVoted) {
      const user = this.authenticatedUser.getPublicUser()
      list = list.filter(
        (url: PostedUrl) => !url.hasUserVotedNegatively(user)
      )
    }

    this.playlist = list.map((url: PostedUrl) => url.urlModel.videoId)
  }
}
</script>
