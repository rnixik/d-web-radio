<template>
  <div>
    <h1>About</h1>
    <p>The project is completely open source.</p>
    <p>
      Main source code is published on GitHub: <a href="https://github.com/rnixik/d-web-radio">https://github.com/rnixik/d-web-radio</a>.
    </p>
    <div>
      This application uses the following components:
      <ul>
        <li>Signaling server to exchange connection parameters without saving any data: <a href="https://github.com/rnixik/webrtc-signaler/blob/master/server.js">https://github.com/rnixik/webrtc-signaler</a></li>
        <li>A library with transactions algorithms with user authentication, validation, storing <a href="https://github.com/rnixik/d-web-core">https://github.com/rnixik/d-web-core</a></li>
        <li>A package to unify WebRTC interaction with signaling <a href="https://github.com/rnixik/webrtc-connection">https://github.com/rnixik/webrtc-connection</a></li>
        <li>Turn server to relay WebRTC messages through NAT in some cases: <a href="https://github.com/coturn/coturn">https://github.com/coturn/coturn</a></li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
@Component
export default class About extends Vue {

}
</script>
