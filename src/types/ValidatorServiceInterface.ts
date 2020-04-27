import { Transaction } from '@/models/Transaction'

export interface ValidatorServiceInterface {
  validateBase (storedTransactions: Transaction[], tx: Transaction): void
  validateSpecific (storedTransactions: Transaction[], tx: Transaction): Promise<void>
}
