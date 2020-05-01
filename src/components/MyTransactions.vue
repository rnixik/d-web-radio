<template>
  <div>
    My transactions ({{ transactions.length }}):
    <ol v-if="transactions && transactions.length">
      <li v-for="transaction in transactions.slice(-10).reverse()" :key="transaction.hash">
        {{ transaction.type }} -
        <span title="Signatures">{{ transaction.signatures.length}}</span> -
        {{ transaction.storedAt.toLocaleString() }}
      </li>
    </ol>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Transaction } from 'd-web-core/lib/models/Transaction'

@Component
export default class MyTransactions extends Vue {
  @Prop({ default: [] }) transactions!: Transaction[]
}
</script>
