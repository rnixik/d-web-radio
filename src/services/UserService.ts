import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { CryptoService } from '@/services/CryptoService'
import { StorageService } from '@/services/StorageService'
import { TransactionService } from '@/services/TransactionService'
import { User } from '@/models/User'

export class UserService {
  private cryptoService: CryptoService
  private storageService: StorageService
  private transactionService: TransactionService

  constructor (cryptoService: CryptoService, storageService: StorageService, transitionService: TransactionService) {
    this.cryptoService = cryptoService
    this.storageService = storageService
    this.transactionService = transitionService
  }

  public register (login: string, password: string): AuthenticatedUser {
    const authenticatedUser = this.cryptoService.getUserByLoginAndPassword(login, password)
    const publicUser = authenticatedUser.getPublicUser()

    const transaction = this.transactionService.createRegistrationTransaction(publicUser)

    if (this.getUserByPublicKey(publicUser.publicKey)) {
      throw new Error('User already exists')
    }

    this.storageService.storeTransaction(transaction)

    return authenticatedUser
  }

  private getUserByPublicKey (publicKey: string): User | null {
    const transactions = this.storageService.getTransactions()

    return this.transactionService.getUserByPublicKey(transactions, publicKey)
  }
}
