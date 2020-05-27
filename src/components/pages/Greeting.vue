<template>
  <div class="jumbotron">
    <h1 class="display-3">Decentralized collaborative radio</h1>
    <p class="lead">
      Here you can share your favorite music video from Youtube with
      other parties. Anyone can play, like or dislike these video.
    </p>
    <hr class="my-4">
    <div class="form-group">
      <label for="namespace-input">Namespace</label>
      <input type="text" v-model="namespace" class="form-control" id="namespace-input" aria-describedby="namespace-help" placeholder="Enter any string to start a new room">
      <small id="namespace-help" class="form-text text-muted">Namespace means the name of a room to share your music.</small>
    </div>
    <p class="lead">
      <button class="btn btn-primary btn-lg" @click="begin">Begin</button>
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
@Component
export default class PostedUrlsList extends Vue {
  private namespace = 'demo'

  begin () {
    this.$router.push({ name: 'connections', params: { namespace: this.namespace } })
  }
}
</script>
