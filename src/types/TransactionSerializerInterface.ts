import { Transaction } from '@/models/Transaction'

export interface TransactionSerializerInterface {
  dataToTransaction (data: any, local: boolean): Transaction
  transactionToData (transaction: Transaction, local: boolean): any
}
