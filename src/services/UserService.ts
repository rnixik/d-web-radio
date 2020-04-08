import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { CryptoService } from '@/services/CryptoService'
import { TransactionService } from '@/services/TransactionService'
import { User } from '@/models/User'

export class UserService {
  private cryptoService: CryptoService
  private transactionService: TransactionService

  constructor (
    cryptoService: CryptoService,
    transitionService: TransactionService
  ) {
    this.cryptoService = cryptoService
    this.transactionService = transitionService
  }

  public register (login: string, password: string): AuthenticatedUser {
    const authenticatedUser = this.cryptoService.getUserByLoginAndPassword(login, password)
    const publicUser = authenticatedUser.getPublicUser()

    const transaction = this.transactionService.createRegistrationTransaction(publicUser)

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

  private getUserByPublicKey (publicKey: string): User | null {
    return this.transactionService.getUserByPublicKey(publicKey)
  }
}
