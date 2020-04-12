import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { TransactionService } from '@/services/TransactionService'
import { User } from '@/models/User'
import { UserTransactionType } from '@/transactions/User/UserTransactionType'
import { CryptoServiceInterface } from '@/types/CryptoServiceInterface'
import { UserServiceInterface } from '@/types/UserServiceInterface'
import { UserWithTransactions } from '@/models/UserWithTransactions'

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

  public getUsersWithTransactions (removeIgnored: boolean): UserWithTransactions[] {
    const usersWithTransactions: UserWithTransactions[] = []
    const allTransactions = this.transactionService.getTransactions(removeIgnored)
    const usersIndex: Map<string, UserWithTransactions> = new Map()
    for (const tx of allTransactions) {
      if (tx.type === UserTransactionType.t) {
        const user = tx.model as User
        usersIndex.set(user.publicKey, new UserWithTransactions(user, []))
      }
    }
    for (const tx of allTransactions) {
      const userWithTransactions = usersIndex.get(tx.creator.publicKey)
      if (userWithTransactions) {
        userWithTransactions.addTransaction(tx)
      }
    }

    usersIndex.forEach((userWithTransactions, publicKey) => {
      usersWithTransactions.push(userWithTransactions)
    })

    return usersWithTransactions
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
