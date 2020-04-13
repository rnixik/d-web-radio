import { User } from '@/models/User'
import { PreferencesStorageServiceInterface } from '@/types/PreferencesStorageServiceInterface'
import { IgnoreAndBlockControlServiceInterface } from '@/types/IgnoreAndBlockControlServiceInterface'
import { PreferencesIgnoreAndBlock } from '@/models/PreferencesIgnoreAndBlock'

export class IgnoreAndBlockControlService implements IgnoreAndBlockControlServiceInterface {
  private preferencesStorageService: PreferencesStorageServiceInterface

  constructor (preferencesStorageService: PreferencesStorageServiceInterface) {
    this.preferencesStorageService = preferencesStorageService
  }

  public getPreferences (): PreferencesIgnoreAndBlock {
    return this.preferencesStorageService.getPreferencesIgnoreAndBlock()
  }

  public addUserToBlockWhiteList (user: User): void {
    const preferences = this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.blockWhiteList.push(user)
    this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  public addUserToBlockBlackList (user: User): void {
    const preferences = this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.blockBlackList.push(user)
    this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  public addUserToIgnoreWhiteList (user: User): void {
    const preferences = this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.ignoreWhiteList.push(user)
    this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  public addUserToIgnoreBlackList (user: User): void {
    const preferences = this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.ignoreBlackList.push(user)
    this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }

  public removeUserFromBlockWhiteList (user: User): void {
    const preferences = this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.blockWhiteList = preferences.blockWhiteList.filter((iu) => {
      return iu.publicKey !== user.publicKey
    })
    this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  public removeUserFromBlockBlackList (user: User): void {
    const preferences = this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.blockBlackList = preferences.blockBlackList.filter((iu) => {
      return iu.publicKey !== user.publicKey
    })
    this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  public removeUserFromIgnoreWhiteList (user: User): void {
    const preferences = this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.ignoreWhiteList = preferences.ignoreWhiteList.filter((iu) => {
      return iu.publicKey !== user.publicKey
    })
    this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  public removeUserFromIgnoreBlackList (user: User): void {
    const preferences = this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.ignoreBlackList = preferences.ignoreBlackList.filter((iu) => {
      return iu.publicKey !== user.publicKey
    })
    this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }

  setBlockWhiteListEnabled (enabled: boolean): void {
    const preferences = this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.isBlockWhiteListEnabled = enabled
    this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  setBlockBlackListEnabled (enabled: boolean): void {
    const preferences = this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.isBlockBlackListEnabled = enabled
    this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  setIgnoreWhiteListEnabled (enabled: boolean): void {
    const preferences = this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.isIgnoreWhiteListEnabled = enabled
    this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  setIgnoreBlackListEnabled (enabled: boolean): void {
    const preferences = this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.isIgnoreBlackListEnabled = enabled
    this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
}
