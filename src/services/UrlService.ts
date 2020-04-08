import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { TransactionService } from '@/services/TransactionService'
import { User } from '@/models/User'
import { Url } from '@/models/Url'
import { PostUrlPayload } from '@/models/TransactionPayloads/PostUrlPayload'

export class UrlService {
  private transactionService: TransactionService

  constructor (transitionService: TransactionService) {
    this.transactionService = transitionService
  }

  public postUrl (authenticatedUser: AuthenticatedUser, url: string): Url {
    const publicUser = authenticatedUser.getPublicUser()
    const storedUrls = this.transactionService.getPostUrlTransactions()
    for (const storedTx of storedUrls) {
      if ((storedTx.payload as PostUrlPayload).url === url) {
        throw new Error('Url already posted')
      }
    }

    const transaction = this.transactionService.createPostUrlTransaction(publicUser, url)
    this.transactionService.signAndSend(authenticatedUser, transaction)

    return new Url(url)
  }

  private getUserByPublicKey (publicKey: string): User | null {
    return this.transactionService.getUserByPublicKey(publicKey)
  }
}
