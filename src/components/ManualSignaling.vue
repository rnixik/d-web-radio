<template>
  <div>
    Send it to other party:<br>
    <br>
    <textarea
      v-if="showOutgoingMessage"
      v-model="textToSend"
      class="text-to-copy form-control"
    ></textarea>
    <button @click="copy" class="btn btn-secondary">Copy</button><br>

    <div><button @click="initiate" class="btn btn-secondary">Initiate</button></div>
    <div>
      <div>Paste it here:<br>
        <textarea v-model="remote" class="form-control"></textarea><br/>
        <button @click="applyRemote" class="btn btn-secondary">Apply remote</button>
      </div>
    </div>
    <div v-if="connectionError" class="alert alert-danger">Connection error</div>
    <div v-if="isConnected" class="alert alert-success">CONNECTED</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ManualSignaling as ManualSignalingImplementation, WebRtcConnectionsPool } from 'webrtc-connection'

@Component
export default class ManualSignaling extends Vue {
  @Prop() connectionsPool?: WebRtcConnectionsPool
  signaling?: ManualSignalingImplementation
  remote: string = ''
  textToSend: string = ''
  showOutgoingMessage: boolean = false
  isConnected: boolean = false
  connectionError: boolean = false

  created (): void {
    this.signaling = new ManualSignalingImplementation()
    this.signaling.bindOnOutgoingDataCallback((message: string) => {
      this.textToSend = message
    })
    this.signaling.bindOnWebRtcConnectionErrorCallback((id: string) => {
      this.connectionError = true
    })

    const connection = this.connectionsPool!.connect(this.signaling!)
    connection.addOnOpenCallback(() => {
      this.isConnected = true
      this.$root.$emit('manualConnected')
    })
  }

  initiate (): void {
    this.showOutgoingMessage = true
    this.signaling!.initiate()
    this.connectionError = false
  }

  copy (): void {
    const textToCopyElement = document.querySelector('.text-to-copy') as HTMLTextAreaElement
    if (textToCopyElement) {
      textToCopyElement.select()
      textToCopyElement.setSelectionRange(0, 99999)
      document.execCommand('copy')
    }
  }

  applyRemote (): void {
    this.connectionError = false
    this.showOutgoingMessage = true
    this.signaling!.applyRemoteResponse(JSON.parse(this.remote))
  }
}
</script>
