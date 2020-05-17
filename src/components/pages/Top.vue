<template>
  <div>
    <h2>Top-100</h2>
    <posted-urls-list
      :posted-urls="postedUrlsTop.slice(0, 100)"
      :user="authenticatedUser"
      list-id="latest"
    ></posted-urls-list>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import PostedUrlsList from '@/components/PostedUrlsList.vue'
import { PostedUrl } from '@/app/models/PostedUrl'
import { AuthenticatedUser } from 'd-web-core/lib/models/AuthenticatedUser'
@Component({
  components: {
    PostedUrlsList
  }
})
export default class Radio extends Vue {
  @Prop({ default: [] }) postedUrlsTop!: PostedUrl[]
  @Prop({ default: null }) authenticatedUser!: AuthenticatedUser
}
</script>
