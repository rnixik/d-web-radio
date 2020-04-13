<template>
  <div>
    Users:
    <ul v-if="usersWithTransactions && usersWithTransactions.length">
      <li v-for="userWithTransactions in usersWithTransactions" :key="userWithTransactions.user.publicKey">
        <user :user="userWithTransactions.user"></user>: {{ userWithTransactions.transactions.length }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { UserWithTransactions } from '@/models/UserWithTransactions'
import User from '@/components/User.vue'
@Component({
  components: { User }
})
export default class UsersList extends Vue {
  @Prop({ default: [] }) usersWithTransactions!: UserWithTransactions[]
}
</script>
