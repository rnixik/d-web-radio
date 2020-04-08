import { Transaction } from '@/models/Transaction'
import { UserRegistrationPayload } from '@/models/TransactionPayloads/UserRegistrationPayload'
import { TransactionType } from '@/enums/TransactionType'
import { User } from '@/models/User'
import { Transport } from '@/services/Transport'
import { StorageService } from '@/services/StorageService'
import { Validator } from '@/services/Validator'
import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { CryptoService } from '@/services/CryptoService'
import { Signature } from '@/models/Signature'
import { PostUrlPayload } from '@/models/TransactionPayloads/PostUrlPayload'
import { PostedUrl } from '@/models/PostedUrl'

export class TransactionService {
  private transport: Transport
  private storageService: StorageService
  private validator: Validator
  private cryptoService: CryptoService
  private onNewTransactionsCallbacks: ((transactions: Transaction[]) => void)[] = []
  private onNewPostedUrlsCallbacks: ((urls: PostedUrl[]) => void)[] = []

  constructor (
    cryptoService: CryptoService,
    transport: Transport,
    storageService: StorageService,
    validator: Validator
  ) {
    this.transport = transport
    this.storageService = storageService
    this.validator = validator
    this.cryptoService = cryptoService

    this.transport.addOnIncomingTransactionsCallback((transactions) => {
      this.handleIncomingTransactions(transactions)
    })
  }

  public createRegistrationTransaction (publicUser: User): Transaction {
    const payload = new UserRegistrationPayload(publicUser.login, publicUser.publicKey)
    const hash = this.cryptoService.calculateTransactionHash(TransactionType.UserRegistration, payload)

    return new Transaction(publicUser.publicKey, TransactionType.UserRegistration, payload, hash)
  }

  public createPostUrlTransaction (publicUser: User, url: string): Transaction {
    const payload = new PostUrlPayload(url)
    const hash = this.cryptoService.calculateTransactionHash(TransactionType.PostUrl, payload)

    return new Transaction(publicUser.publicKey, TransactionType.PostUrl, payload, hash)
  }

  public getUserByPublicKey (publicKey: string): User | null {
    const storedTransactions = this.storageService.getTransactions()

    for (const tx of storedTransactions) {
      if (tx.type !== TransactionType.UserRegistration) {
        continue
      }
      const payload = tx.payload as UserRegistrationPayload
      if (payload.publicKey === publicKey) {
        return new User(payload.login, payload.publicKey)
      }
    }

    return null
  }

  public getPostUrlTransactions (): Transaction[] {
    const storedTransactions = this.storageService.getTransactions()
    const postUrlTransactions: Transaction[] = []

    for (const tx of storedTransactions) {
      if (tx.type === TransactionType.PostUrl) {
        postUrlTransactions.push(tx)
      }
    }

    return postUrlTransactions
  }

  public signAndSend (sender: AuthenticatedUser, transaction: Transaction) {
    const signedTx = this.cryptoService.signTransaction(sender, transaction)

    this.transport.send(signedTx)
  }

  public addOnNewTransactionsCallback (callback: (transactions: Transaction[]) => void) {
    this.onNewTransactionsCallbacks.push(callback)
  }

  public addOnNewPostedUrlsCallback (callback: (urls: PostedUrl[]) => void) {
    this.onNewPostedUrlsCallbacks.push(callback)
  }

  private handleIncomingTransactions (incomingTransactions: Transaction[]) {
    const storedTransactions = this.storageService.getTransactions()
    const transactionsToStore: Transaction[] = []

    for (const incomingTx of incomingTransactions) {
      try {
        this.validator.validateBase(storedTransactions, incomingTx)
      } catch (e) {
        console.error('Incoming transaction is invalid by base rules', e, incomingTx)
        continue
      }

      let txWasStored = false
      for (const storedTx of storedTransactions) {
        if (incomingTx.hash === storedTx.hash) {
          this.updateStoredTransactionFromIncoming(storedTx, incomingTx)
          txWasStored = true
          break
        }
      }
      if (!txWasStored) {
        try {
          this.validator.validateSpecific(storedTransactions, incomingTx)
          transactionsToStore.push(incomingTx)
        } catch (e) {
          console.error('Incoming transaction is invalid by specific rules', e, incomingTx)
        }
      }
    }

    if (transactionsToStore.length) {
      const newStoredTransactions = this.storageService.storeTransactions(transactionsToStore)
      if (newStoredTransactions.length) {
        this.notifyContextAboutNewTransactions(newStoredTransactions)
      }
    }
  }

  private updateStoredTransactionFromIncoming (storedTx: Transaction, incomingTx: Transaction) {
    const signatures = storedTx.signatures.concat(incomingTx.signatures)
    const publicKeys: any = {}
    const uniqueSignatures: Signature[] = []
    for (const signature of signatures) {
      if (!publicKeys[signature.publicKey]) {
        publicKeys[signature.publicKey] = true
        uniqueSignatures.push(signature)
      }
    }

    this.storageService.storeTransactionSignatures(storedTx, uniqueSignatures)
  }

  private notifyContextAboutNewTransactions (transactions: Transaction[]) {
    for (const callback of this.onNewTransactionsCallbacks) {
      callback(transactions)
    }

    const newPostedUrls: PostedUrl[] = []
    for (const tx of transactions) {
      if (tx.type === TransactionType.PostUrl) {
        const payload = tx.payload as PostUrlPayload
        const creator = this.getUserByPublicKey(tx.creatorPublicKey)
        if (!creator) {
          console.error('Cannot find creator of transaction: ' + tx.creatorPublicKey)
          continue
        }
        const url = new PostedUrl(payload.url, creator)
        newPostedUrls.push(url)
      }
    }

    if (newPostedUrls.length) {
      for (const callback of this.onNewPostedUrlsCallbacks) {
        callback(newPostedUrls)
      }
    }
  }
}
