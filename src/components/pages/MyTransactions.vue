<template>
  <div>
    <h1>My transactions</h1>
    <div v-if="myTransactions">
      My transactions ({{ myTransactions.length }}):
      <ol v-if="myTransactions && myTransactions.length">
        <li v-for="transaction in myTransactions.slice(-10).reverse()" :key="transaction.hash">
          {{ transaction.type }} -
          <span title="Signatures">{{ transaction.signatures.length}}</span> -
          {{ transaction.storedAt.toLocaleString() }}
        </li>
      </ol>
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
