<template>
  <span v-html="identicon"></span>
</template>

<script lang="ts">
import { Component, Emit, Vue, Prop } from 'vue-property-decorator'
import { User } from 'd-web-core/lib/models/User'

@Component
export default class Identicon extends Vue {
  @Prop({ default: null }) user!: User
  @Prop({ default: 64 }) size!: number

  get identicon () {
    const jdenticon = require('jdenticon')
    return jdenticon.toSvg(this.user.publicKey, this.size)
  }
}
</script>
