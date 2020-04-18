<template>
  <div>
    Urls:
    <ul v-if="postedUrls && postedUrls.length">
      <li v-for="postedUrl in postedUrls" :key="postedUrl.url">
        <span v-bind:class="{voted: user && postedUrl.hasUserVotedNegatively(user)}">N{{ postedUrl.geNegativeVotes().length }}</span>
        <span v-bind:class="{voted: user && postedUrl.hasUserVotedPositively(user)}">P{{ postedUrl.getPositiveVotes().length }}</span>
        {{ postedUrl.getYouTubeUrl() }} by
        <user :user="postedUrl.user"></user>
        <span v-if="user && !postedUrl.hasUserVoted(user)">
          <span @click="voteUp(postedUrl)">[UP]</span>
          <span @click="voteDown(postedUrl)">[DOWN]</span>
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
  .voted {
    font-weight: bold;
  }
</style>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'
import { User as UserModel } from '@/models/User'
import User from '@/components/User.vue'
import { EventHub } from '@/components/EventHub'
@Component({
  components: { User }
})
export default class PostedUrlsList extends Vue {
  @Prop({ default: [] }) postedUrls!: YouTubeUrlModel[]
  @Prop({ default: null }) user!: UserModel

  voteUp (urlModel: YouTubeUrlModel) {
    EventHub.$emit('vote', urlModel, true)
  }

  voteDown (urlModel: YouTubeUrlModel) {
    EventHub.$emit('vote', urlModel, false)
  }
}
</script>
