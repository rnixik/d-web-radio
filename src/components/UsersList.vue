<template>
  <div>
    Users:
    <transition name="fade">
      <ul v-if="usersWithTransactions && usersWithTransactions.length">
        <li v-for="userWithTransactions in usersWithTransactions" :key="userWithTransactions.user.publicKey">
          {{ userWithTransactions.user.login }}: {{ userWithTransactions.transactions.length }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { UserWithTransactions } from '@/models/UserWithTransactions'

@Component
export default class UsersList extends Vue {
  @Prop({ default: [] }) usersWithTransactions!: UserWithTransactions[]
}
</script>
