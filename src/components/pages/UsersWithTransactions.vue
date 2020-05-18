<template>
  <div>
    <h1></h1>
    <div>
      <users-list :users-with-transactions="usersWithTransactions"></users-list>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { UserWithTransactions } from 'd-web-core/lib/models/UserWithTransactions'
import UsersList from '@/components/UsersList.vue'
@Component({
  components: {
    UsersList
  }
})
export default class UsersWithTransactions extends Vue {
  @Prop({ default: [] }) usersWithTransactions!: UserWithTransactions[]
}
</script>
