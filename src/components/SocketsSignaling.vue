<template>
  <div>
    <div v-if="!signalingIsConnected" class="form-group">
      <label for="sockets-address">Address: </label>
      <input
        id="sockets-address"
        class="form-control"
        v-model="address"
        :disabled="connectingSignaling"
        aria-describedby="socketsAddressHelp"
      >
      <small id="socketsAddressHelp" class="form-text text-muted">Use the default Web Sockets signaling server or enter your one.</small>
    </div>
    <button class="btn btn-primary" @click="connect">Connect</button>

    <div v-if="signalingIsConnected" class="alert alert-warning">Signaling is CONNECTED, waiting for peers</div>
    <div v-if="peerConnected" class="alert alert-success">PEER CONNECTED</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { SocketIoSignaling, WebRtcConnectionsPool } from 'webrtc-connection'

@Component
export default class SocketsSignaling extends Vue {
  @Prop() connectionsPool?: WebRtcConnectionsPool
  @Prop({ default: 'example' }) room!: string
  signaling?: SocketIoSignaling
  address: string = 'https://signaler.local:8881'
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
