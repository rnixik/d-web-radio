import { Transaction } from '@/models/Transaction'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'
import { User } from '@/models/User'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'
import { YouTubeUrlPayload } from '@/app/transactions/YouTubeUrl/YouTubeUrlPayload'

export class YouTubeUrlExtractor {
  public extract (transaction: Transaction, creator: User): YouTubeUrlModel {
    if (transaction.type !== YouTubeUrlTransactionType.t) {
      throw new Error('Wrong type of transaction to extract: ' + transaction.type)
    }
    const payload = transaction.payload as YouTubeUrlPayload
    return new YouTubeUrlModel(payload.videoId, creator)
  }
}
