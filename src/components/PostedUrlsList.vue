<template>
  <div>
    Urls ({{ postedUrls.length }}):
    <ol v-if="postedUrls && postedUrls.length">
      <li v-for="postedUrl in postedUrls.slice(0, 100)" :key="postedUrl.urlModel.videoId">
        <span v-bind:class="{voted: user && postedUrl.hasUserVotedNegatively(user)}">N{{ postedUrl.getNegativeVotes().length }}</span>
        <span v-bind:class="{voted: user && postedUrl.hasUserVotedPositively(user)}">P{{ postedUrl.getPositiveVotes().length }}</span>
        {{ postedUrl.urlModel.title }} by
        <user :user="postedUrl.urlModel.user"></user>
        at {{ postedUrl.storedAt.toLocaleString() }}
        <span v-if="user && !postedUrl.hasUserVoted(user)">
          <span @click="voteUp(postedUrl)">[UP]</span>
          <span @click="voteDown(postedUrl)">[DOWN]</span>
        </span>
        <span @click="play(postedUrl)">[PLAY]</span>
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
import { User as UserModel } from '@/models/User'
import User from '@/components/User.vue'
import { EventHub } from '@/components/EventHub'
import { PostedUrl } from '@/app/models/PostedUrl'
@Component({
  components: { User }
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
