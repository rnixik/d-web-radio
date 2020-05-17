<template>
  <div>
    <h1>Radio</h1>
    <posted-urls-list
      :posted-urls="postedUrls"
      :user="authenticatedUser"
      list-id="latest"
    ></posted-urls-list>

    <button
      role="button"
      class="btn btn-primary"
      v-bind:class="activeConnectionsNum < 1 ? 'disabled' : ''"
      data-toggle="modal"
      data-target="#postUrlModal"
    >Add video
    </button>

    <!-- Modal -->
    <div class="modal fade" id="postUrlModal" tabindex="-1" role="dialog" aria-labelledby="postUrlModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="postUrlModalLabel">Add video</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="postUrlInput">Link to a video on YouTube</label>
              <input
                type="text"
                class="form-control"
                id="postUrlInput"
                v-model="url"
                aria-describedby="postUrlHelp">
              <small id="postUrlHelp" class="form-text text-muted">It should be a link to a music video</small>
            </div>
            <div class="alert alert-danger" v-if="postUrlErrorMessage">
              {{ postUrlErrorMessage }}
            </div>
            <div class="alert alert-warning" v-if="activeConnectionsNum < 1">
              You are not connected to the network
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" ref="postUrlCloseBtn" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary disabled" v-if="isInProgress">...</button>
            <button
              type="button"
              class="btn btn-primary"
              v-bind:class="activeConnectionsNum < 1 ? 'disabled' : ''"
              v-if="!isInProgress"
              @click="addUrl"
            >Post video</button>
          </div>
        </div>
      </div>
    </div>
    <!-- ./Modal -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import PostedUrlsList from '@/components/PostedUrlsList.vue'
import { PostedUrl } from '@/app/models/PostedUrl'
import { AuthenticatedUser } from 'd-web-core/lib/models/AuthenticatedUser'
import { YouTubeRadio } from '@/app/YouTubeRadio'

@Component({
  components: {
    PostedUrlsList
  }
})
export default class Radio extends Vue {
  @Prop({ default: [] }) postedUrls!: PostedUrl[]
  @Prop({ default: null }) youTubeRadio!: YouTubeRadio
  @Prop({ default: null }) authenticatedUser!: AuthenticatedUser
  @Prop({ default: 0 }) activeConnectionsNum!: number

  private url = ''
  private postUrlErrorMessage = ''
  private isInProgress = false

  $refs!: {
    postUrlCloseBtn: HTMLElement
  }

  async addUrl () {
    if (this.activeConnectionsNum < 1 || !this.url || !this.youTubeRadio || !this.authenticatedUser) {
      return
    }
    this.postUrlErrorMessage = ''

    try {
      this.isInProgress = true
      await this.youTubeRadio.postUrl(this.authenticatedUser, this.url)
      this.url = ''
      this.$refs.postUrlCloseBtn.click()
    } catch (e) {
      console.error(e)
      this.postUrlErrorMessage = e.toString()
    }

    this.isInProgress = false
  }
}
</script>
