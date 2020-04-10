import { Transaction } from '@/models/Transaction'

export interface TransportServiceInterface {
  send (transactions: Transaction[]): void
  addOnIncomingTransactionsCallback (callback: (transactions: Transaction[]) => void): void
}
