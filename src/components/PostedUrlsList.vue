<template>
  <div>
    Urls:
    <ul v-if="postedUrls && postedUrls.length">
      <li v-for="postedUrl in postedUrls" :key="postedUrl.url">
        {{ postedUrl.getYouTubeUrl() }} by <user :user="postedUrl.user"></user>
        <span @click="voteUp(postedUrl)">[UP]</span> <span @click="voteDown(postedUrl)">[DOWN]</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'
import User from '@/components/User.vue'
import { EventHub } from '@/components/EventHub'
@Component({
  components: { User }
})
export default class PostedUrlsList extends Vue {
  @Prop({ default: [] }) postedUrls!: YouTubeUrlModel[]

  voteUp (urlModel: YouTubeUrlModel) {
    EventHub.$emit('vote', urlModel, true)
  }

  voteDown (urlModel: YouTubeUrlModel) {
    EventHub.$emit('vote', urlModel, false)
  }
}
</script>
