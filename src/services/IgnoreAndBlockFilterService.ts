import { Transaction } from '@/models/Transaction'
import { PreferencesStorageServiceInterface } from '@/types/PreferencesStorageServiceInterface'
import { User } from '@/models/User'
import { IgnoreAndBlockFilterServiceInterface } from '@/types/IgnoreAndBlockFilterServiceInterface'

export class IgnoreAndBlockFilterService implements IgnoreAndBlockFilterServiceInterface {
  private preferencesStorageService: PreferencesStorageServiceInterface

  constructor (preferencesStorageService: PreferencesStorageServiceInterface) {
    this.preferencesStorageService = preferencesStorageService
  }

  public filterBlocked (transactions: Transaction[]): Transaction[] {
    const preferencesIgnoreAndBlock = this.preferencesStorageService.getPreferencesIgnoreAndBlock()

    if (preferencesIgnoreAndBlock.isBlockWhiteListEnabled) {
      return IgnoreAndBlockFilterService.filterWhiteList(transactions, preferencesIgnoreAndBlock.blockWhiteList)
    }

    if (preferencesIgnoreAndBlock.isBlockBlackListEnabled) {
      return IgnoreAndBlockFilterService.filterBlackList(transactions, preferencesIgnoreAndBlock.blockBlackList)
    }

    return transactions
  }

  private static getPublicKeysFromUsers (users: User[]): string[] {
    return users.map((user) => {
      return user.publicKey
    })
  }

  private static filterBlackList (transactions: Transaction[], blackList: User[]): Transaction[] {
    const blackListPublicKeys = IgnoreAndBlockFilterService.getPublicKeysFromUsers(blackList)
    // Remove transactions
    transactions = transactions.filter((tx) => {
      // If not in list
      return blackListPublicKeys.indexOf(tx.creator.publicKey) === -1
    })
    // Remove signatures
    transactions = transactions.map((tx) => {
      tx.signatures = tx.signatures.filter((signature) => {
        // If not in list
        return blackListPublicKeys.indexOf(signature.publicKey) === -1
      })
      return tx
    })

    return transactions
  }

  private static filterWhiteList (transactions: Transaction[], whiteList: User[]): Transaction[] {
    const whiteListPublicKeys = IgnoreAndBlockFilterService.getPublicKeysFromUsers(whiteList)

    // Remove transactions
    transactions = transactions.filter((tx) => {
      // If exists in list
      return whiteListPublicKeys.indexOf(tx.creator.publicKey) > -1
    })
    // Remove signatures
    transactions = transactions.map((tx) => {
      tx.signatures = tx.signatures.filter((signature) => {
        // If exists in list
        return whiteListPublicKeys.indexOf(signature.publicKey) > -1
      })
      return tx
    })

    return transactions
  }
}
