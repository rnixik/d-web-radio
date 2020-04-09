import { SpecificValidator } from '@/types/SpecificValidator'
import { Transaction } from '@/models/Transaction'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'

export class YouTubeUrlValidator implements SpecificValidator {
  public validate (storedTransactions: Transaction[], tx: Transaction): void {
    const youTubeUrl = tx.model as YouTubeUrlModel
    if (!youTubeUrl.videoId) {
      throw new Error('Empty video ID')
    }
    if (youTubeUrl.videoId.length !== 11) {
      throw new Error('Incorrect video ID')
    }

    // Validate uniqueness
    for (const storedTx of storedTransactions) {
      if (storedTx.type !== YouTubeUrlTransactionType.t) {
        continue
      }
      const storedYouTubeUrl = storedTx.model as YouTubeUrlModel
      if (storedYouTubeUrl.videoId === youTubeUrl.videoId) {
        throw new Error('Url already posted')
      }
    }
  }
}
