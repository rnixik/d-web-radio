import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { TransactionService } from '@/services/TransactionService'
import { User } from '@/models/User'
import { PostedUrl } from '@/models/PostedUrl'
import { PostUrlPayload } from '@/models/TransactionPayloads/PostUrlPayload'

export class UrlService {
  private transactionService: TransactionService

  constructor (transitionService: TransactionService) {
    this.transactionService = transitionService
  }

  public postUrl (authenticatedUser: AuthenticatedUser, url: string): PostedUrl {
    const publicUser = authenticatedUser.getPublicUser()
    const storedPostedUrls = this.transactionService.getPostedUrls()
    for (const storedPostedUrl of storedPostedUrls) {
      if (storedPostedUrl.url === url) {
        throw new Error('Url already posted')
      }
    }

    const transaction = this.transactionService.createPostUrlTransaction(publicUser, url)
    this.transactionService.signAndSend(authenticatedUser, transaction)

    return new PostedUrl(url, publicUser)
  }

  private getUserByPublicKey (publicKey: string): User | null {
    return this.transactionService.getUserByPublicKey(publicKey)
  }
}
