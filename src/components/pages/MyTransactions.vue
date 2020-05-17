<template>
  <div>
    <h1>My transactions: {{ myTransactions.length }}</h1>
    <div v-if="myTransactions">
      <table class="table table-striped" v-if="myTransactions && myTransactions.length">
        <tr>
          <td>Type</td>
          <td>Signatures</td>
          <td>Stored at</td>
        </tr>
        <tr v-for="transaction in myTransactions.slice(-100).reverse()" :key="transaction.hash">
          <td>{{ transaction.type }}</td>
          <td>{{ transaction.signatures.length}}</td>
          <td>{{ transaction.storedAt.toLocaleString() }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Transaction } from 'd-web-core/lib/models/Transaction'
@Component
export default class MyTransactions extends Vue {
  @Prop({ default: [] }) myTransactions!: Transaction[]
}
</script>
