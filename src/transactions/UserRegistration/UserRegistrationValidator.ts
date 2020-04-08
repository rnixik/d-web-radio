import { SpecificValidator } from '@/types/SpecificValidator'
import { Transaction } from '@/models/Transaction'
import { UserRegistrationPayload } from '@/transactions/UserRegistration/UserRegistrationPayload'
import { UserRegistrationTransactionType } from '@/transactions/UserRegistration/UserRegistrationTransactionType'

export class UserRegistrationValidator implements SpecificValidator {
  public validate (storedTransactions: Transaction[], tx: Transaction): void {
    for (const storedTx of storedTransactions) {
      if (storedTx.type !== UserRegistrationTransactionType.t) {
        continue
      }
      const storedPayload = storedTx.payload as UserRegistrationPayload
      const payload = tx.payload as UserRegistrationPayload
      if (storedPayload.publicKey === payload.publicKey) {
        throw new Error('User already registered')
      }
    }
  }
}
