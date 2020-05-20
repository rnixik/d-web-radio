<template>
  <div>
    <div v-if="!initiated && !showIncomingMessage">
      <button @click="initiate" class="btn btn-secondary mr-2">I want to initiate</button>
      <button @click="showIncomingMessage = true" class="btn btn-secondary">Enter message from other party</button>
    </div>

    <div v-if="showOutgoingMessage" class="form-group">
      <label for="textToSend">Copy and send the message to the other party:</label>
      <textarea
        id="textToSend"
        v-model="textToSend"
        class="text-to-copy form-control"
      ></textarea>
      <button @click="copy" class="btn btn-secondary mt-2">Copy</button>
    </div>

    <div v-if="showIncomingMessage" class="form-group">
      <label v-if="initiated" for="incomingMessageInput">
        Wait for the message from the other party, paste it here and click the button below:
      </label>
      <label v-if="!initiated" for="incomingMessageInput">
        Paste the message from the other party and click the button below:
      </label>
      <textarea
        id="incomingMessageInput"
        v-model="remote"
        class="form-control"
      ></textarea>
      <button @click="applyRemote" class="btn btn-secondary mt-2">Apply remote</button>
    </div>

    <div v-if="waitingForConnection" >
      Waiting for connection...
      <div class="spinner-grow" role="status">
        <span class="sr-only">Waiting for connection...</span>
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
  showIncomingMessage: boolean = false
  initiated: boolean = false
  isConnected: boolean = false
  connectionError: boolean = false
  waitingForConnection: boolean = false

  created (): void {
    this.signaling = new ManualSignalingImplementation()
    this.signaling.bindOnOutgoingDataCallback((message: string) => {
      this.textToSend = message
    })
    this.signaling.bindOnWebRtcConnectionErrorCallback((id: string) => {
      this.connectionError = true
      this.waitingForConnection = false
    })

    const connection = this.connectionsPool!.connect(this.signaling)
    connection.addOnOpenCallback(() => {
      this.isConnected = true
      this.waitingForConnection = false
    })
  }

  initiate (): void {
    this.initiated = true
    this.showOutgoingMessage = true
    this.showIncomingMessage = true
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
    this.showIncomingMessage = false
    this.waitingForConnection = true
  }
}
</script>
