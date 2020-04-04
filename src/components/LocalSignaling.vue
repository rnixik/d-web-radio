<template>
  <div>
    <div><button @click="initiate">Initiate local</button></div>
    <div v-if="connectionError">Connection error</div>
    <div v-if="isConnected">CONNECTED</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { LocalSignaling as LocalSignalingImplementation, WebRtcConnectionsPool } from 'webrtc-connection'

@Component
export default class LocalSignaling extends Vue {
  @Prop() connectionsPool?: WebRtcConnectionsPool
  signaling?: LocalSignalingImplementation
  showOutgoingMessage: boolean = false
  isConnected: boolean = false
  connectionError: boolean = false

  created (): void {
    this.signaling = new LocalSignalingImplementation()
    this.signaling.bindOnWebRtcConnectionErrorCallback((id: string) => {
      this.connectionError = true
    })

    const connection = this.connectionsPool!.connect(this.signaling!)
    connection.addOnOpenCallback(() => {
      this.isConnected = true
    })
  }

  initiate (): void {
    this.showOutgoingMessage = true
    this.signaling!.initiate(1)
    this.connectionError = false
  }
}
</script>
