import { SpecificValidator } from '@/types/SpecificValidator'
import { Transaction } from '@/models/Transaction'
import { YouTubeUrlPayload } from '@/app/transactions/YouTubeUrl/YouTubeUrlPayload'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'

export class YouTubeUrlValidator implements SpecificValidator {
  validate (storedTransactions: Transaction[], tx: Transaction): void {
    for (const storedTx of storedTransactions) {
      if (storedTx.type !== YouTubeUrlTransactionType.t) {
        continue
      }
      const storedPayload = storedTx.payload as YouTubeUrlPayload
      const payload = tx.payload as YouTubeUrlPayload
      if (storedPayload.url === payload.url) {
        throw new Error('Url already posted')
      }
    }
  }
}
