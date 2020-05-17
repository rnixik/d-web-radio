<template>
  <div>
    <h1>Top 100</h1>
    <posted-urls-list
      :posted-urls="postedUrlsTop.slice(0, 100)"
      :user="authenticatedUser"
      list-id="top"
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
export default class Top extends Vue {
  @Prop({ default: [] }) postedUrlsTop!: PostedUrl[]
  @Prop({ default: null }) authenticatedUser!: AuthenticatedUser
}
</script>
