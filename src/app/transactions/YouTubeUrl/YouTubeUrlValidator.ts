import { SpecificValidator } from '@/types/SpecificValidator'
import { Transaction } from '@/models/Transaction'
import { YouTubeUrlPayload } from '@/app/transactions/YouTubeUrl/YouTubeUrlPayload'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'

export class YouTubeUrlValidator implements SpecificValidator {
  public validate (storedTransactions: Transaction[], tx: Transaction): void {
    const payload = tx.payload as YouTubeUrlPayload
    if (!payload.videoId) {
      throw new Error('Empty video ID')
    }
    if (payload.videoId.length !== 11) {
      throw new Error('Incorrect video ID')
    }

    // Validate uniqueness
    for (const storedTx of storedTransactions) {
      if (storedTx.type !== YouTubeUrlTransactionType.t) {
        continue
      }
      const storedPayload = storedTx.payload as YouTubeUrlPayload
      if (storedPayload.videoId === payload.videoId) {
        throw new Error('Url already posted')
      }
    }
  }
}
