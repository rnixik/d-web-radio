<template>
  <span>
    <identicon v-if="showIdenticon" :user="user" size="24"></identicon>
    <span @click="showDialog(user)">{{ user.login }}</span>
  </span>
</template>

<script lang="ts">
import { Component, Emit, Vue, Prop } from 'vue-property-decorator'
import { User } from 'd-web-core/lib/models/User'
import { EventHub } from '@/components/EventHub'
import Identicon from '@/components/Identicon.vue'

@Component({
  components: {
    Identicon
  }
})
export default class UsersList extends Vue {
  @Prop({ default: null }) user!: User
  @Prop({ default: true }) showIdenticon!: boolean

  showDialog (user: User) {
    this.$modal.show('dialog', {
      title: user.login,
      text: '<p>Click "Block" user if you think it is bot and publishes only flood.</p>' +
        '<p>Click "Ignore" if you do not want see his/her transactions anymore.</p>' +
        '<p>Use whitelists to make a list users whom you trust and block (ignore) others.</p>',
      buttons: [
        {
          title: 'Block',
          handler: () => {
            EventHub.$emit('userControl', 'block', user)
            this.$modal.hide('dialog')
          }
        },
        {
          title: 'Ignore',
          handler: () => {
            EventHub.$emit('userControl', 'ignore', user)
            this.$modal.hide('dialog')
          }
        },
        {
          title: 'Add to whitelist (block-level)',
          handler: () => {
            EventHub.$emit('userControl', 'addToBlockWhiteList', user)
            this.$modal.hide('dialog')
          }
        },
        {
          title: 'Add to whitelist (ignore-level)',
          handler: () => {
            EventHub.$emit('userControl', 'addToIgnoreWhiteList', user)
            this.$modal.hide('dialog')
          }
        },
        {
          title: 'Close',
          default: true
        }
      ]
    })
  }
}
</script>
