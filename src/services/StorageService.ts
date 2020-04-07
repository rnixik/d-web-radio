import { Transaction } from '@/models/Transaction'
import { TransactionSerializer } from '@/services/TransactionSerializer'
import { Signature } from '@/models/Signature'

export class StorageService {
  private static STORAGE_KEY_TRANSACTIONS = 'transactions';

  private readonly namespace: string
  private readonly transactionSerializer: TransactionSerializer

  constructor (namespace: string, transactionSerializer: TransactionSerializer) {
    this.namespace = namespace
    this.transactionSerializer = transactionSerializer
  }

  public storeTransaction (transaction: Transaction): boolean {
    if (this.doesTransactionExist(transaction)) {
      return false
    }

    const transactions = this.getTransactions()
    transaction.storedAt = (new Date()).toISOString()
    transactions.push(transaction)
    this.storeTransactions(transactions)

    return true
  }

  public storeTransactionSignatures (transaction: Transaction, signatures: Signature[]): void {
    const transactions = this.getTransactions()
    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].hash === transaction.hash) {
        transactions[i].signatures = signatures
      }
    }

    this.storeTransactions(transactions)
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
        transactions.push(this.transactionSerializer.dataToTransaction(txData, true))
      } catch (e) {
        throw new Error('Restoring transaction error: ' + e.message)
      }
    }

    return transactions
  }

  private storeTransactions (transactions: Transaction[]): void {
    const serialized = []
    for (const tx of transactions) {
      serialized.push(this.transactionSerializer.transactionToData(tx, true))
    }

    localStorage.setItem(this.namespace + ':' + StorageService.STORAGE_KEY_TRANSACTIONS, JSON.stringify(serialized))
  }
}
