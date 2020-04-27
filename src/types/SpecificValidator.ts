import { Transaction } from '@/models/Transaction'

export interface SpecificValidator {
  validate(storedTransactions: Transaction[], tx: Transaction): Promise<void>
}
