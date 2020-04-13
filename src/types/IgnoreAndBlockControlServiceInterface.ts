import { User } from '@/models/User'
import { PreferencesIgnoreAndBlock } from '@/models/PreferencesIgnoreAndBlock'

export interface IgnoreAndBlockControlServiceInterface {
  getPreferences (): PreferencesIgnoreAndBlock
  addUserToBlockWhiteList (user: User): void
  addUserToBlockBlackList (user: User): void
  addUserToIgnoreWhiteList (user: User): void
  addUserToIgnoreBlackList (user: User): void
  removeUserFromBlockWhiteList (user: User): void
  removeUserFromBlockBlackList (user: User): void
  removeUserFromIgnoreWhiteList (user: User): void
  removeUserFromIgnoreBlackList (user: User): void
  setBlockWhiteListEnabled (enabled: boolean): void
  setBlockBlackListEnabled (enabled: boolean): void
  setIgnoreWhiteListEnabled (enabled: boolean): void
  setIgnoreBlackListEnabled (enabled: boolean): void
}
