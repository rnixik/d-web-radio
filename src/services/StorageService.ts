import { Transaction } from '@/models/Transaction'
import { Signature } from '@/models/Signature'
import { StorageServiceInterface } from '@/types/StorageServiceInterface'
import { TransactionSerializerInterface } from '@/types/TransactionSerializerInterface'
import { User } from '@/models/User'
import { PreferencesStorageServiceInterface } from '@/types/PreferencesStorageServiceInterface'
import { PreferencesIgnoreAndBlock } from '@/models/PreferencesIgnoreAndBlock'

export class StorageService implements StorageServiceInterface, PreferencesStorageServiceInterface {
  private static STORAGE_KEY_TRANSACTIONS = 'transactions'
  private static STORAGE_KEY_PREFERENCES = 'preferences'

  private readonly namespace: string
  private readonly transactionSerializer: TransactionSerializerInterface

  constructor (namespace: string, transactionSerializer: TransactionSerializerInterface) {
    this.namespace = namespace
    this.transactionSerializer = transactionSerializer
  }

  public storeTransactions (transactions: Transaction[]): Transaction[] {
    const storedTransactions = this.getTransactions()
    let storedHashIndex = new Map()
    for (const tx of storedTransactions) {
      storedHashIndex.set(tx.hash, true)
    }

    const transactionsToStore = storedTransactions
    const newStored: Transaction[] = []

    for (const tx of transactions) {
      if (!storedHashIndex.has(tx.hash)) {
        tx.storedAt = new Date()
        transactionsToStore.push(tx)
        newStored.push(tx)
      }
    }

    this.replaceAllTransactions(transactionsToStore)

    return newStored
  }

  public storeTransactionSignatures (transaction: Transaction, signatures: Signature[]): void {
    const transactions = this.getTransactions()
    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].hash === transaction.hash) {
        transactions[i].signatures = signatures
      }
    }

    this.replaceAllTransactions(transactions)
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

  public getPreferencesIgnoreAndBlock (): PreferencesIgnoreAndBlock {
    const str = localStorage.getItem(this.namespace + ':' + StorageService.STORAGE_KEY_PREFERENCES)
    if (!str) {
      return new PreferencesIgnoreAndBlock(
        [],
        [],
        true,
        false,
        [],
        [],
        true,
        false
      )
    }
    return JSON.parse(str) as PreferencesIgnoreAndBlock
  }

  public storePreferencesIgnoreAndBlock (preferences: PreferencesIgnoreAndBlock): void {
    localStorage.setItem(this.namespace + ':' + StorageService.STORAGE_KEY_PREFERENCES, JSON.stringify(preferences))
  }

  public replaceAllTransactions (transactions: Transaction[]): void {
    const serialized = []
    for (const tx of transactions) {
      serialized.push(this.transactionSerializer.transactionToData(tx, true))
    }

    localStorage.setItem(this.namespace + ':' + StorageService.STORAGE_KEY_TRANSACTIONS, JSON.stringify(serialized))
  }
}
