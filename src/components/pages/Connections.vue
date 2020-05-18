<template>
  <div>
    <h1>Connection page</h1>

    <div v-if="connectionsPool">
      <ul class="nav nav-tabs mb-2" role="tablist">
        <li class="nav-item">
          <a class="nav-link active" id="sockets-tab" data-toggle="tab" href="#sockets" role="tab" aria-controls="sockets" aria-selected="true">Sockets</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="manual-tab" data-toggle="tab" href="#manual" role="tab" aria-controls="manual" aria-selected="false">Manual</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="local-tab" data-toggle="tab" href="#local" role="tab" aria-controls="local" aria-selected="false">Local (debug)</a>
        </li>
      </ul>
      <div class="tab-content">
        <div class="tab-pane fade show active" id="sockets" role="tabpanel" aria-labelledby="sockets-tab">
          <SocketsSignaling :room="namespace" :connectionsPool="connectionsPool"/>
        </div>
        <div class="tab-pane fade" id="manual" role="tabpanel" aria-labelledby="manual-tab">
          <ManualSignaling :connectionsPool="connectionsPool"/>
        </div>
        <div class="tab-pane fade" id="local" role="tabpanel" aria-labelledby="local-tab">
          <LocalSignaling :connectionsPool="connectionsPool"/>
        </div>
      </div>
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
}
</script>
