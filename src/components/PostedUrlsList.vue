<template>
  <div>
    Urls:
    <transition name="fade">
      <ul v-if="postedUrls && postedUrls.length">
        <li v-for="postedUrl in postedUrls" :key="postedUrl.url">
          {{ postedUrl.url }} by {{ postedUrl.user.login }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'

@Component
export default class PostedUrlsList extends Vue {
  @Prop({ default: [] }) postedUrls!: YouTubeUrlModel[]
}
</script>
