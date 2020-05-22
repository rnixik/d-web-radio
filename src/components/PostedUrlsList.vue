<template>
  <div>
    <ol v-if="postedUrls && postedUrls.length" class="list-unstyled">
      <li
        v-for="postedUrl in postedUrls.slice(0, 100)"
        :key="postedUrl.urlModel.videoId"
        class="media mb-5"
      >
        <img :src="postedUrl.urlModel.poster" width="156" alt="" class="mr-3">
        <div class="media-body">
          <h5 class="mt-0">
            <a href="javascript:void(0);" @click="play(postedUrl)">{{ postedUrl.urlModel.title }}</a>
          </h5>
          <div class="media">
            <identicon :user="postedUrl.urlModel.user" size="60" class="mr-2"></identicon>
            <div class="media-body">
              <div>
                {{ postedUrl.storedAt.toLocaleString() }}
                <span v-bind:class="{voted: user && postedUrl.hasUserVotedNegatively(user)}">N{{ postedUrl.getNegativeVotes().length }}</span>
                <span v-bind:class="{voted: user && postedUrl.hasUserVotedPositively(user)}">P{{ postedUrl.getPositiveVotes().length }}</span>

                <span v-if="user && !postedUrl.hasUserVoted(user)">
                  <span @click="voteUp(postedUrl)">[UP]</span>
                  <span @click="voteDown(postedUrl)">[DOWN]</span>
                </span>
              </div>
              <user :user="postedUrl.urlModel.user" :showIdenticon="false"></user>
            </div>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
  .voted {
    font-weight: bold;
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
    EventHub.$emit('vote', postedUrl, true)
  }

  voteDown (postedUrl: PostedUrl) {
    EventHub.$emit('vote', postedUrl, false)
  }

  play (postedUrl: PostedUrl) {
    EventHub.$emit('play', postedUrl, this.listId)
  }
}
</script>
