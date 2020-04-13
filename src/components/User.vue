<template>
  <span>
    <span @click="showDialog(user)">{{ user.login }}</span>
  </span>
</template>

<script lang="ts">
import { Component, Emit, Vue, Prop } from 'vue-property-decorator'
import { User } from '@/models/User'
import { EventHub } from '@/components/EventHub'

@Component
export default class UsersList extends Vue {
  @Prop({ default: null }) user!: User

  showDialog (user: User) {
    this.$modal.show('dialog', {
      title: user.login,
      text: '<p>Click "Block" user if you think it is bot and publishes only flood.</p><p>Click "Ignore" if you do not want see his/her transactions anymore.</p>',
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
          title: 'Close',
          default: true
        }
      ]
    })
  }
}
</script>
