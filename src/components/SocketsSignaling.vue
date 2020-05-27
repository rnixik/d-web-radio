<template>
  <div>
    <div v-if="!signalingIsConnected" class="form-group">
      <label for="sockets-address">Address:</label>
      <input
        id="sockets-address"
        class="form-control"
        v-model="address"
        :disabled="connectingSignaling"
        aria-describedby="socketsAddressHelp"
      >
      <small id="socketsAddressHelp" class="form-text text-muted">Use the default Web Sockets signaling server or enter your one.</small>
    </div>

    <button v-if="!signalingIsConnected && !connectingSignaling" class="btn btn-primary mb-4" @click="connect">Connect</button>

    <div v-if="signalingIsConnected" class="alert alert-warning mb-4">Signaling is CONNECTED, waiting for peers</div>

    <div v-if="peerConnected" class="alert alert-success mb-4">
      PEER CONNECTED
      <p>
        <router-link to="radio"><span>Go to Radio page</span></router-link>
      </p>
    </div>

    <div v-if="countdown > 0 && !cancelCountdown" class="alert alert-info mb-4">
      Auto-connect in {{ countdown }}s...
      <button class="btn btn-secondary" @click="cancelCountdown = true">Cancel</button>
    </div>
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
  address: string = 'https://signaler.getid.org'
  peerConnected: boolean = false
  connectingSignaling: boolean = false
  signalingIsConnected: boolean = false
  countdown = 5
  cancelCountdown = false

  created (): void {
    this.countdownTick()
  }

  countdownTick (): void {
    if (this.cancelCountdown) {
      return
    }
    this.countdown -= 1
    if (this.countdown > 0) {
      window.setTimeout(() => {
        this.countdownTick()
      }, 1000)
    } else {
      this.connect()
    }
  }

  connect (): void {
    this.cancelCountdown = true
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
