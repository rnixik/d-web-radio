<template>
  <div>
    Send it to other party:<br>
    <br>
    <textarea v-if="showOutgoingMessage" v-model="textToSend" class="text-to-copy"></textarea><button @click="copy">Copy</button><br>
    <div><button @click="initiate">Initiate</button></div>
    <div>
      <div>Paste it here:<br><textarea v-model="remote"></textarea><br/>
        <button @click="applyRemote">Apply remote</button>
      </div>
    </div>
    <div v-if="connectionError">Connection error</div>
    <div v-if="isConnected">CONNECTED</div>
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
