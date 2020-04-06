import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { CryptoService } from '@/services/CryptoService'
import { TransactionService } from '@/services/TransactionService'
import { User } from '@/models/User'
import { Transport } from '@/services/Transport'

export class UserService {
  private cryptoService: CryptoService
  private transactionService: TransactionService
  private transport: Transport

  constructor (
    cryptoService: CryptoService,
    transitionService: TransactionService,
    transport: Transport
  ) {
    this.cryptoService = cryptoService
    this.transactionService = transitionService
    this.transport = transport
  }

  public register (login: string, password: string): AuthenticatedUser {
    const authenticatedUser = this.cryptoService.getUserByLoginAndPassword(login, password)
    const publicUser = authenticatedUser.getPublicUser()

    const transaction = this.transactionService.createRegistrationTransaction(publicUser)

    if (this.getUserByPublicKey(publicUser.publicKey)) {
      throw new Error('User already exists')
    }

    this.transport.send(authenticatedUser, transaction)

    return authenticatedUser
  }

  private getUserByPublicKey (publicKey: string): User | null {
    return this.transactionService.getUserByPublicKey(publicKey)
  }
}
