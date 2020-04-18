import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { TransactionService } from '@/services/TransactionService'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'
import { Transaction } from '@/models/Transaction'
import { UserServiceInterface } from '@/types/UserServiceInterface'
import { YouTubeIdExtractor } from '@/app/services/YouTubeIdExtractor'
import { YouTubeUrlVoteModel } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteModel'
import { YouTubeUrlVoteTransactionType } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteTransactionType'
import { PostedUrl } from '@/app/models/PostedUrl'

export class YouTubeRadio {
  private readonly transactionService: TransactionService
  private readonly userService: UserServiceInterface
  private onNewPostedUrlsCallbacks: ((urls: PostedUrl[]) => void)[] = []

  constructor (transactionService: TransactionService, userService: UserServiceInterface) {
    this.transactionService = transactionService
    this.userService = userService

    this.transactionService.addOnNewTransactionsCallback((newTransactions: Transaction[], storedTransactions) => {
      this.handleNewTransactions(newTransactions)
    })
  }

  public postUrl (authenticatedUser: AuthenticatedUser, url: string): YouTubeUrlModel {
    const publicUser = authenticatedUser.getPublicUser()
    const videoIdExtractor = new YouTubeIdExtractor()
    const videoId = videoIdExtractor.extractVideoId(url)
    const youTubeUrlModel = new YouTubeUrlModel(videoId, publicUser)
    const transaction = this.transactionService.createTransaction(publicUser, YouTubeUrlTransactionType.t, youTubeUrlModel)
    this.transactionService.signAndSend(authenticatedUser, transaction)

    return youTubeUrlModel
  }

  public getPostedUrls (): PostedUrl[] {
    const storedTransactions = this.transactionService.getTransactions(true)

    return this.extractUrlsFromTransactions(storedTransactions)
  }

  public addOnNewPostedUrlsCallback (callback: (urls: PostedUrl[]) => void) {
    this.onNewPostedUrlsCallbacks.push(callback)
  }

  public handleNewTransactions (transactions: Transaction[]): void {
    const newPostedUrls = this.extractUrlsFromTransactions(transactions)
    if (newPostedUrls.length) {
      for (const callback of this.onNewPostedUrlsCallbacks) {
        callback(newPostedUrls)
      }
    }
  }

  public vote (authenticatedUser: AuthenticatedUser, postedUrl: PostedUrl, isPositive: boolean): void {
    const publicUser = authenticatedUser.getPublicUser()
    const youTubeUrlVoteModel = new YouTubeUrlVoteModel(postedUrl.urlModel.videoId, publicUser, isPositive)
    const transaction = this.transactionService.createTransaction(publicUser, YouTubeUrlVoteTransactionType.t, youTubeUrlVoteModel)
    this.transactionService.signAndSend(authenticatedUser, transaction)
  }

  public extractUrlsFromTransactions (transactions: Transaction[]): PostedUrl[] {
    const urlsIndex: Map<string, PostedUrl> = new Map()

    for (const tx of transactions) {
      if (tx.type === YouTubeUrlTransactionType.t) {
        const urlModel = tx.model as YouTubeUrlModel
        const postedUrl = new PostedUrl(urlModel, [])
        urlsIndex.set(urlModel.videoId, postedUrl)
      }
    }

    for (const tx of transactions) {
      if (tx.type === YouTubeUrlVoteTransactionType.t) {
        const urlVoteModel = tx.model as YouTubeUrlVoteModel
        const postedUrl = urlsIndex.get(urlVoteModel.videoId)
        if (postedUrl) {
          postedUrl.addVote(urlVoteModel)
        }
      }
    }

    const postedUrls: PostedUrl[] = []
    urlsIndex.forEach((urlModel) => {
      postedUrls.push(urlModel)
    })

    return postedUrls
  }
}
