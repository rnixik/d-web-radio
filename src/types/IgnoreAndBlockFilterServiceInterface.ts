import { Transaction } from '@/models/Transaction'

export interface IgnoreAndBlockFilterServiceInterface {
  filterBlocked (transactions: Transaction[]): Transaction[]
}
