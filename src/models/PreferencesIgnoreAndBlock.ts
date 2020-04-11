import { User } from '@/models/User'

export class PreferencesIgnoreAndBlock {
  // Here "block" means current user do not store transactions and signatures of blocked user.
  // It also means, the current user can store a duplicated model of a blocked user,
  // but other users who do not block that user can not validate this duplicated models.
  public blockBlackList: User[]
  public blockWhiteList: User[]
  public isBlockBlackListEnabled: boolean
  public isBlockWhiteListEnabled: boolean

  constructor (
    blockBlackList: User[],
    blockWhiteList: User[],
    isBlockBlackListEnabled: boolean,
    isBlockWhiteListEnabled: boolean
  ) {
    this.blockBlackList = blockBlackList
    this.blockWhiteList = blockWhiteList
    this.isBlockBlackListEnabled = isBlockBlackListEnabled
    this.isBlockWhiteListEnabled = isBlockWhiteListEnabled
  }
}
