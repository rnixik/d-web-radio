import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { TransactionService } from '@/services/TransactionService'
import { YouTubeUrlPayload } from '@/app/transactions/YouTubeUrl/YouTubeUrlPayload'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'
import { UserService } from '@/services/UserService'
import { Transaction } from '@/models/Transaction'
import { YouTubeUrlExtractor } from '@/app/transactions/YouTubeUrl/YouTubeUrlExtractor'

export class YouTubeRadio {
  private readonly transactionService: TransactionService
  private readonly userService: UserService
  private onNewPostedUrlsCallbacks: ((urls: YouTubeUrlModel[]) => void)[] = []

  constructor (transactionService: TransactionService, userService: UserService) {
    this.transactionService = transactionService
    this.userService = userService

    this.transactionService.addOnNewTransactionsCallback((transactions: Transaction[]) => {
      this.handleNewTransactions(transactions)
    })
  }

  public postUrl (authenticatedUser: AuthenticatedUser, url: string): YouTubeUrlModel {
    const publicUser = authenticatedUser.getPublicUser()
    const storedPostedUrls = this.getPostedUrls()
    for (const storedPostedUrl of storedPostedUrls) {
      if (storedPostedUrl.url === url) {
        throw new Error('Url already posted')
      }
    }

    const payload = new YouTubeUrlPayload(url)
    const transaction = this.transactionService.createTransaction(publicUser, YouTubeUrlTransactionType.t, payload)
    this.transactionService.signAndSend(authenticatedUser, transaction)

    return new YouTubeUrlModel(url, publicUser)
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
