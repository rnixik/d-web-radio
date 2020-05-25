import { AuthenticatedUser } from 'd-web-core/lib/models/AuthenticatedUser'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'
import { Transaction } from 'd-web-core/lib/models/Transaction'
import { YouTubeIdExtractor } from '@/app/services/YouTubeIdExtractor'
import { YouTubeUrlVoteModel } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteModel'
import { YouTubeUrlVoteTransactionType } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteTransactionType'
import { PostedUrl } from '@/app/models/PostedUrl'
import { RegularDecentralizedApplication } from 'd-web-core/lib/RegularDecentralizedApplication'
import { WebRtcConnectionsPool } from 'webrtc-connection'
import { YouTubeUrlSerializer } from '@/app/transactions/YouTubeUrl/YouTubeUrlSerializer'
import { YouTubeUrlVoteSerializer } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteSerializer'
import { YouTubeUrlVoteValidator } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteValidator'
import { YouTubeUrlValidator } from '@/app/transactions/YouTubeUrl/YouTubeUrlValidator'

export class YouTubeRadio {
  public readonly dApp: RegularDecentralizedApplication
  private onNewPostedUrlsCallbacks: ((urls: PostedUrl[]) => void)[] = []

  constructor (namespace: string, maxVideoDuration: number, connectionsPool: WebRtcConnectionsPool) {
    const youTubeUrlValidator = new YouTubeUrlValidator()
    youTubeUrlValidator.maxVideoDuration = maxVideoDuration

    this.dApp = new RegularDecentralizedApplication(namespace, connectionsPool)
    this.dApp.transactionTypeResolver.setPayloadSerializer(YouTubeUrlTransactionType.t, new YouTubeUrlSerializer())
    this.dApp.transactionTypeResolver.setSpecificValidator(YouTubeUrlTransactionType.t, youTubeUrlValidator)
    this.dApp.transactionTypeResolver.setPayloadSerializer(YouTubeUrlVoteTransactionType.t, new YouTubeUrlVoteSerializer())
    this.dApp.transactionTypeResolver.setSpecificValidator(YouTubeUrlVoteTransactionType.t, new YouTubeUrlVoteValidator())

    this.dApp.transactionService.addOnNewTransactionsCallback((newTransactions: Transaction[]) => {
      this.handleNewTransactions(newTransactions)
    })
  }

  public async postUrl (authenticatedUser: AuthenticatedUser, url: string): Promise<void> {
    const publicUser = authenticatedUser.getPublicUser()
    const videoIdExtractor = new YouTubeIdExtractor()
    const videoId = videoIdExtractor.extractVideoId(url)
    const youTubeUrlModel = new YouTubeUrlModel(videoId, publicUser)
    const transaction = await this.dApp.transactionService.createTransaction(publicUser, YouTubeUrlTransactionType.t, youTubeUrlModel)
    await this.dApp.transactionService.signAndSend(authenticatedUser, transaction)
  }

  public async getPostedUrls (sortByDate = false): Promise<PostedUrl[]> {
    const storedTransactions = await this.dApp.transactionService.getTransactions(true)
    const postedUrls = this.extractUrlsFromTransactions(storedTransactions)

    return postedUrls.sort((a: PostedUrl, b: PostedUrl) => {
      if (!sortByDate) {
        const scoreA = a.getScore()
        const scoreB = b.getScore()
        if (scoreA > scoreB) {
          return -1
        }
        if (scoreA < scoreB) {
          return 1
        }
      }
      if (a.storedAt > b.storedAt) {
        return -1
      }
      if (a.storedAt < b.storedAt) {
        return 1
      }

      const origPosA = postedUrls.indexOf(a)
      const origPosB = postedUrls.indexOf(b)

      if (origPosA > origPosB) {
        return -1
      }

      if (origPosA < origPosB) {
        return 1
      }

      return 0
    })
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

  public async vote (authenticatedUser: AuthenticatedUser, postedUrl: PostedUrl, isPositive: boolean): Promise<void> {
    const publicUser = authenticatedUser.getPublicUser()
    const youTubeUrlVoteModel = new YouTubeUrlVoteModel(postedUrl.urlModel.videoId, publicUser, isPositive)
    const transaction = await this.dApp.transactionService.createTransaction(publicUser, YouTubeUrlVoteTransactionType.t, youTubeUrlVoteModel)
    await this.dApp.transactionService.signAndSend(authenticatedUser, transaction)
  }

  public extractUrlsFromTransactions (transactions: Transaction[]): PostedUrl[] {
    const urlsIndex: Map<string, PostedUrl> = new Map()

    for (const tx of transactions) {
      if (tx.type === YouTubeUrlTransactionType.t) {
        const urlModel = tx.model as YouTubeUrlModel
        const postedUrl = new PostedUrl(
          urlModel,
          tx.storedAt ? tx.storedAt : new Date()
        )
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
