import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { TransactionService } from '@/services/TransactionService'
import { User } from '@/models/User'
import { UserTransactionType } from '@/transactions/User/UserTransactionType'
import { CryptoServiceInterface } from '@/types/CryptoServiceInterface'
import { UserServiceInterface } from '@/types/UserServiceInterface'

export class UserService implements UserServiceInterface {
  private cryptoService: CryptoServiceInterface
  private transactionService: TransactionService

  constructor (
    cryptoService: CryptoServiceInterface,
    transitionService: TransactionService
  ) {
    this.cryptoService = cryptoService
    this.transactionService = transitionService
  }

  public register (login: string, password: string): AuthenticatedUser {
    const authenticatedUser = this.cryptoService.getUserByLoginAndPassword(login, password)
    const publicUser = authenticatedUser.getPublicUser()
    const transaction = this.transactionService.createTransaction(publicUser, UserTransactionType.t, publicUser)
    this.transactionService.signAndSend(authenticatedUser, transaction)

    return authenticatedUser
  }

  public login (login: string, password: string): AuthenticatedUser {
    const authenticatedUser = this.cryptoService.getUserByLoginAndPassword(login, password)

    if (!this.getUserByPublicKey(authenticatedUser.getPublicUser().publicKey)) {
      throw new Error('User has not been registered')
    }

    return authenticatedUser
  }

  private getUserByPublicKey (publicKey: string): User | null {
    const storedTransactions = this.transactionService.getTransactions()

    for (const tx of storedTransactions) {
      if (tx.type !== UserTransactionType.t) {
        continue
      }
      const user = tx.model as User
      if (user.publicKey === publicKey) {
        return user
      }
    }

    return null
  }
}
