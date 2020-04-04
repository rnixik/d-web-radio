import { Transaction } from '@/models/Transaction'
import { UserRegistrationPayload } from '@/models/TransactionPayloads/UserRegistrationPayload'
import { TransactionType } from '@/enums/TransactionType'
import { User } from '@/models/User'
import { TransactionHasher } from '@/services/TransactionHasher'

export class TransactionService {
  private transactionHasher: TransactionHasher

  constructor (transactionHasher: TransactionHasher) {
    this.transactionHasher = transactionHasher
  }

  public createRegistrationTransaction (publicUser: User): Transaction {
    const payload = new UserRegistrationPayload(publicUser.login, publicUser.publicKey)
    const hash = this.transactionHasher.calculateHash(TransactionType.UserRegistration, payload)

    return new Transaction(TransactionType.UserRegistration, payload, hash)
  }

  public getUserByPublicKey (transactions: Transaction[], publicKey: string): User | null {
    for (const tx of transactions) {
      if (tx.type !== TransactionType.UserRegistration) {
        continue
      }
      const payload = tx.payload as UserRegistrationPayload
      if (payload.publicKey === publicKey) {
        return new User(payload.login, payload.publicKey)
      }
    }

    return null
  }
}
