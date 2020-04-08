import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { TransactionService } from '@/services/TransactionService'
import { User } from '@/models/User'
import { UserRegistrationPayload } from '@/transactions/UserRegistration/UserRegistrationPayload'
import { UserRegistrationTransactionType } from '@/transactions/UserRegistration/UserRegistrationTransactionType'
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

    const payload = new UserRegistrationPayload(publicUser.login, publicUser.publicKey)
    const transaction = this.transactionService.createTransaction(publicUser, UserRegistrationTransactionType.t, payload)

    if (this.getUserByPublicKey(publicUser.publicKey)) {
      throw new Error('User already exists')
    }

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

  public getUserByPublicKey (publicKey: string): User | null {
    const storedTransactions = this.transactionService.getTransactions()

    for (const tx of storedTransactions) {
      if (tx.type !== UserRegistrationTransactionType.t) {
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
