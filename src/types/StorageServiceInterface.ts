import { Transaction } from '@/models/Transaction'
import { Signature } from '@/models/Signature'

export interface StorageServiceInterface {
  storeTransactions (transactions: Transaction[]): Transaction[]
  storeTransactionSignatures (transaction: Transaction, signatures: Signature[]): void
  getTransactions (): Transaction[]
  replaceAllTransactions (transactions: Transaction[]): void
}
