<template>
  <div>
    <ol v-if="postedUrls && postedUrls.length" class="list-unstyled">
      <li
        v-for="postedUrl in postedUrls.slice(0, 100)"
        :key="postedUrl.urlModel.videoId"
        class="media mb-5"
        v-bind:class="{
          voted: user && postedUrl.hasUserVoted(user),
          votedUp: user && postedUrl.hasUserVotedPositively(user),
          votedDown: user && postedUrl.hasUserVotedNegatively(user),
          canVote: user && !postedUrl.hasUserVoted(user)
        }"
      >
        <div class="mr-4 text-center votes-container">
          <a
            @click="voteUp(postedUrl)"
             href="javascript: void(0);"
             class="vote-btn vote-up-btn"
          >
            <svg id="i-chevron-top" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M30 20 L16 8 2 20" />
            </svg>
          </a>
          <div>
            <svg id="i-plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="14" height="14" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M16 2 L16 30 M2 16 L30 16" />
            </svg>
            {{ postedUrl.getPositiveVotes().length }}
          </div>
          <div>
            <svg id="i-minus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="14" height="14" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M2 16 L30 16" />
            </svg>
            {{ postedUrl.getNegativeVotes().length }}
          </div>
          <a
            @click="voteDown(postedUrl)"
            href="javascript: void(0);"
            class="vote-btn vote-down-btn"
          >
            <svg id="i-chevron-bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M30 12 L16 24 2 12" />
            </svg>
          </a>
        </div>
        <div class="mr-3">
          <img v-if="postedUrl.urlModel.poster" :src="postedUrl.urlModel.poster" @click="play(postedUrl)" width="156" alt="">
          <img v-if="!postedUrl.urlModel.poster" src="@/assets/no_poster.png" @click="play(postedUrl)" width="156" alt="">
          <div class="text-muted">
            <small>{{ postedUrl.storedAt.toLocaleString() }}</small>
          </div>
        </div>
        <div class="media-body">
          <h5 class="mt-0">
            <a
              href="javascript:void(0);"
              @click="play(postedUrl)"
              class="video-title"
            >{{ postedUrl.urlModel.title }}</a>
          </h5>
          <div class="media">
            <identicon :user="postedUrl.urlModel.user" size="60" class="mr-2"></identicon>
            <div class="media-body">
              <div class="mb-2">
              <user
                :user="postedUrl.urlModel.user"
                :showIdenticon="false"
              ></user>
              </div>
              <div class="text-muted" :title="postedUrl.urlModel.user.publicKey">
                {{ postedUrl.urlModel.user.publicKey.substr(0, 4) }}...{{ postedUrl.urlModel.user.publicKey.substr(-4) }}
              </div>
            </div>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
  .vote-btn {
    color: #4e5458;
    display: block;
  }

  .canVote .vote-btn:hover {
    color: #ffffff;
  }

  .votedDown .vote-down-btn,
  .votedUp .vote-up-btn
  {
    font-weight: bold;
    color: #ffffff;
  }

  .voted .vote-btn {
    cursor: not-allowed;
  }

  .votedDown .video-title {
    color: #4e5458;
  }
</style>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { User as UserModel } from 'd-web-core/lib/models/User'
import User from '@/components/User.vue'
import { EventHub } from '@/components/EventHub'
import { PostedUrl } from '@/app/models/PostedUrl'
import Identicon from '@/components/Identicon.vue'

@Component({
  components: {
    Identicon,
    User
  }
})
export default class PostedUrlsList extends Vue {
  @Prop({ default: [] }) postedUrls!: PostedUrl[]
  @Prop({ default: null }) user!: UserModel
  @Prop({ default: '' }) listId!: string

  voteUp (postedUrl: PostedUrl) {
    if (postedUrl.hasUserVoted(this.user)) {
      return
    }
    EventHub.$emit('vote', postedUrl, true)
  }

  voteDown (postedUrl: PostedUrl) {
    if (postedUrl.hasUserVoted(this.user)) {
      return
    }
    EventHub.$emit('vote', postedUrl, false)
  }

  play (postedUrl: PostedUrl) {
    EventHub.$emit('play', postedUrl, this.listId)
  }
}
</script>
