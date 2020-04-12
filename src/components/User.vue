<template>
  <span>{{ user.login }}</span>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { User } from '@/models/User'

@Component
export default class UsersList extends Vue {
  @Prop({ default: null }) user!: User
}
</script>
