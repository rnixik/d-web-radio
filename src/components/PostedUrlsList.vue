<template>
  <div>
    Urls:
    <transition name="fade">
      <ul v-if="postedUrls && postedUrls.length">
        <li v-for="postedUrl in postedUrls" :key="postedUrl.url">
          {{ postedUrl.getYouTubeUrl() }} by <user :user="postedUrl.user"></user>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'
import User from '@/components/User.vue'
@Component({
  components: { User }
})
export default class PostedUrlsList extends Vue {
  @Prop({ default: [] }) postedUrls!: YouTubeUrlModel[]
}
</script>
