import { Transaction } from '@/models/Transaction'

export interface TransportServiceInterface {
  send (transaction: Transaction): void
  addOnIncomingTransactionsCallback (callback: (transactions: Transaction[]) => void): void
}
