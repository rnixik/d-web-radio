import { Transaction } from '@/models/Transaction'
import { PostedUrl } from '@/models/PostedUrl'
import { PostUrlPayload } from '@/models/TransactionPayloads/PostUrlPayload'
import { TransactionType } from '@/enums/TransactionType'
import { User } from '@/models/User'

export class TransactionToPostedUrl {
  public extract (transaction: Transaction, creator: User): PostedUrl {
    if (transaction.type !== TransactionType.PostUrl) {
      throw new Error('Wrong type of transaction to extract: ' + transaction.type)
    }
    const payload = transaction.payload as PostUrlPayload
    return new PostedUrl(payload.url, creator)
  }
}
