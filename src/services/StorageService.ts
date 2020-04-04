import { Transaction } from '@/models/Transaction'
import { TransactionSerializer } from '@/services/TransactionSerializer'

export class StorageService {
  private static STORAGE_KEY_TRANSACTIONS = 'transactions';

  private readonly namespace: string
  private readonly arrayToTransaction: TransactionSerializer

  constructor (namespace: string, arrayToTransaction: TransactionSerializer) {
    this.namespace = namespace
    this.arrayToTransaction = arrayToTransaction
  }

  public storeTransaction (transaction: Transaction): boolean {
    if (this.doesTransactionExist(transaction)) {
      return false
    }

    transaction.storedAt = (new Date()).toISOString()

    const transactions = this.getTransactions()
    transactions.push(transaction)
    localStorage.setItem(this.namespace + ':' + StorageService.STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions))

    return true
  }

  public doesTransactionExist (transaction: Transaction): boolean {
    const transactions = this.getTransactions()
    for (const iteratedTransaction of transactions) {
      if (iteratedTransaction.hash === transaction.hash) {
        return true
      }
    }

    return false
  }

  public getTransactions (): Transaction[] {
    const transactionsString = localStorage.getItem(this.namespace + ':' + StorageService.STORAGE_KEY_TRANSACTIONS)
    if (!transactionsString) {
      return []
    }

    const transactionsData = JSON.parse(transactionsString)
    if (!transactionsData) {
      return []
    }

    const transactions: Transaction[] = []
    for (const txData of transactionsData) {
      try {
        transactions.push(this.arrayToTransaction.dataToTransaction(txData))
      } catch (e) {
        throw new Error('Restoring transaction error: ' + e.message)
      }
    }

    return transactions
  }
}
