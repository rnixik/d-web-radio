<template>
  <div>
    <div v-if="!signalingIsConnected">
      <label>Address: <input v-model="address" :disabled="connectingSignaling"></label>
      <label>Room: <input v-model="room" :disabled="connectingSignaling"></label>
      <button @click="connect">Connect</button>
    </div>
    <div v-if="signalingIsConnected">Signaling is CONNECTED, waiting for peers</div>
    <div v-if="peerConnected">PEER CONNECTED</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { SocketIoSignaling, WebRtcConnectionsPool } from 'webrtc-connection'

@Component
export default class SocketsSignaling extends Vue {
  @Prop() connectionsPool?: WebRtcConnectionsPool
  signaling?: SocketIoSignaling
  address: string = 'https://signaler.local:8881'
  room: string = 'example'
  peerConnected: boolean = false
  connectingSignaling: boolean = false
  signalingIsConnected: boolean = false

  connect (): void {
    this.connectingSignaling = true
    this.signaling = new SocketIoSignaling(this.address, this.room)
    this.signaling.prepare().then(() => {
      this.connectingSignaling = false
      this.signalingIsConnected = true
      const connection = this.connectionsPool!.connect(this.signaling!)
      connection.addOnOpenCallback(() => {
        this.peerConnected = true
      })
    })
  }
}
</script>
