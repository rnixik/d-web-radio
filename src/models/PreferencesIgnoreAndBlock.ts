import { User } from '@/models/User'

export class PreferencesIgnoreAndBlock {
  // Here "block" means current user do not store transactions and signatures of a blocked user.
  // It also means that the current user can store a duplicated model of a blocked user,
  // but other users who do not block that user can not validate this duplicated models.
  // Suitable for bots and their flood.
  public blockBlackList: User[]
  public blockWhiteList: User[]
  public isBlockBlackListEnabled: boolean
  public isBlockWhiteListEnabled: boolean

  // Here "ignore" means current user do store transactions and signatures of an ignored user,
  // but do not see them in top level of the application.
  // It also means that the current user can not store a duplicated model of an ignored user,
  // even if the current user do not see it.
  // Suitable for regular users with undesired content.
  public ignoreBlackList: User[]
  public ignoreWhiteList: User[]
  public isIgnoreBlackListEnabled: boolean
  public isIgnoreWhiteListEnabled: boolean

  constructor (
    blockBlackList: User[],
    blockWhiteList: User[],
    isBlockBlackListEnabled: boolean,
    isBlockWhiteListEnabled: boolean,
    ignoreBlackList: User[],
    ignoreWhiteList: User[],
    isIgnoreBlackListEnabled: boolean,
    isIgnoreWhiteListEnabled: boolean
  ) {
    this.blockBlackList = blockBlackList
    this.blockWhiteList = blockWhiteList
    this.isBlockBlackListEnabled = isBlockBlackListEnabled
    this.isBlockWhiteListEnabled = isBlockWhiteListEnabled

    this.ignoreBlackList = ignoreBlackList
    this.ignoreWhiteList = ignoreWhiteList
    this.isIgnoreBlackListEnabled = isIgnoreBlackListEnabled
    this.isIgnoreWhiteListEnabled = isIgnoreWhiteListEnabled
  }
}
