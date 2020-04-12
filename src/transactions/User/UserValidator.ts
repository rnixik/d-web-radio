import { SpecificValidator } from '@/types/SpecificValidator'
import { Transaction } from '@/models/Transaction'
import { UserTransactionType } from '@/transactions/User/UserTransactionType'
import { User } from '@/models/User'

export class UserValidator implements SpecificValidator {
  public validate (storedTransactions: Transaction[], tx: Transaction): void {
    const user = tx.model as User
    if (user.login.length < 1) {
      throw new Error('Empty login')
    }

    for (const storedTx of storedTransactions) {
      if (storedTx.type !== UserTransactionType.t) {
        continue
      }
      const storedUser = storedTx.model as User
      if (storedUser.publicKey === user.publicKey) {
        throw new Error('User already registered')
      }
    }
  }
}
