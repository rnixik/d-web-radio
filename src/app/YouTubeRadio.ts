import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { TransactionService } from '@/services/TransactionService'
import { YouTubeUrlPayload } from '@/app/transactions/YouTubeUrl/YouTubeUrlPayload'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'
import { Transaction } from '@/models/Transaction'
import { YouTubeUrlExtractor } from '@/app/transactions/YouTubeUrl/YouTubeUrlExtractor'
import { UserServiceInterface } from '@/types/UserServiceInterface'
import { YouTubeIdExtractor } from '@/app/services/YouTubeIdExtractor'

export class YouTubeRadio {
  private readonly transactionService: TransactionService
  private readonly userService: UserServiceInterface
  private onNewPostedUrlsCallbacks: ((urls: YouTubeUrlModel[]) => void)[] = []

  constructor (transactionService: TransactionService, userService: UserServiceInterface) {
    this.transactionService = transactionService
    this.userService = userService

    this.transactionService.addOnNewTransactionsCallback((transactions: Transaction[]) => {
      this.handleNewTransactions(transactions)
    })
  }

  public postUrl (authenticatedUser: AuthenticatedUser, url: string): YouTubeUrlModel {
    const publicUser = authenticatedUser.getPublicUser()
    const videoIdExtractor = new YouTubeIdExtractor()
    const videoId = videoIdExtractor.extractVideoId(url)
    const payload = new YouTubeUrlPayload(videoId)
    const transaction = this.transactionService.createTransaction(publicUser, YouTubeUrlTransactionType.t, payload)
    this.transactionService.signAndSend(authenticatedUser, transaction)

    return new YouTubeUrlModel(videoId, publicUser)
  }

  public getPostedUrls (): YouTubeUrlModel[] {
    const storedTransactions = this.transactionService.getTransactions()

    return this.extractUrlsFromTransactions(storedTransactions)
  }

  public addOnNewPostedUrlsCallback (callback: (urls: YouTubeUrlModel[]) => void) {
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

  public extractUrlsFromTransactions (transactions: Transaction[]): YouTubeUrlModel[] {
    const postedUrls: YouTubeUrlModel[] = []
    const extractor = new YouTubeUrlExtractor()

    for (const tx of transactions) {
      const creator = this.userService.getUserByPublicKey(tx.creatorPublicKey)
      if (!creator) {
        console.error('Cannot find creator of transaction: ' + tx.creatorPublicKey)
        continue
      }
      if (tx.type === YouTubeUrlTransactionType.t) {
        const postedUrl = extractor.extract(tx, creator)
        postedUrls.push(postedUrl)
      }
    }

    return postedUrls
  }
}
