<template>
  <div>
    <h1>Connection page</h1>

    <div v-if="connectionsPool">
      <LocalSignaling :connectionsPool="connectionsPool"/>
      <ManualSignaling v-if="showManualConnection" :connectionsPool="connectionsPool"/>
      <button @click="showManualConnection = true">Manual connection</button>
      <SocketsSignaling :room="namespace" :connectionsPool="connectionsPool"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { WebRtcConnectionsPool } from 'webrtc-connection'
import LocalSignaling from '@/components/LocalSignaling.vue'
import ManualSignaling from '@/components/ManualSignaling.vue'
import SocketsSignaling from '@/components/SocketsSignaling.vue'
@Component({
  components: {
    LocalSignaling,
    ManualSignaling,
    SocketsSignaling
  }
})
export default class Connection extends Vue {
  @Prop({ default: '' }) namespace!: string
  @Prop({ default: null }) connectionsPool!: WebRtcConnectionsPool

  private showManualConnection: boolean = false
}
</script>
