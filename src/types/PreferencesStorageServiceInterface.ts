import { PreferencesIgnoreAndBlock } from '@/models/PreferencesIgnoreAndBlock'

export interface PreferencesStorageServiceInterface {
  getPreferencesIgnoreAndBlock (): PreferencesIgnoreAndBlock
}
