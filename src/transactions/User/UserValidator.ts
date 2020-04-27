import { SpecificValidator } from '@/types/SpecificValidator'
import { Transaction } from '@/models/Transaction'
import { UserTransactionType } from '@/transactions/User/UserTransactionType'
import { User } from '@/models/User'

export class UserValidator implements SpecificValidator {
  public loginMinLength = 1
  public loginMaxLength = 12

  public async validate (storedTransactions: Transaction[], tx: Transaction): Promise<void> {
    const user = tx.model as User
    if (user.login.length < 1) {
      throw new Error('Empty login')
    }

    if (user.login.length < this.loginMinLength) {
      throw new Error('Login is too short')
    }

    if (user.login.length > this.loginMaxLength) {
      throw new Error('Login is too long')
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
