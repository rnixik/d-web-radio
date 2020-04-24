import { Transaction } from '@/models/Transaction'
import { User } from '@/models/User'
import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { Signature } from '@/models/Signature'
import { TransactionModel } from '@/types/TransactionModel'
import { CryptoServiceInterface } from '@/types/CryptoServiceInterface'
import { StorageServiceInterface } from '@/types/StorageServiceInterface'
import { TransportServiceInterface } from '@/types/TransportServiceInterface'
import { ValidatorServiceInterface } from '@/types/ValidatorServiceInterface'
import { IgnoreAndBlockFilterServiceInterface } from '@/types/IgnoreAndBlockFilterServiceInterface'

export class TransactionService {
  private transport: TransportServiceInterface
  private storageService: StorageServiceInterface
  private validator: ValidatorServiceInterface
  private cryptoService: CryptoServiceInterface
  private ignoreAndBlockFilterService: IgnoreAndBlockFilterServiceInterface
  private onNewTransactionsCallbacks: ((newTransactions: Transaction[], storedTransactions: Transaction[]) => void)[] = []
  private maxSignaturesNumber = 0

  constructor (
    cryptoService: CryptoServiceInterface,
    transport: TransportServiceInterface,
    storageService: StorageServiceInterface,
    validator: ValidatorServiceInterface,
    ignoreAndBlockFilterService: IgnoreAndBlockFilterServiceInterface,
    maxSignaturesNumber: number = 0
  ) {
    this.transport = transport
    this.storageService = storageService
    this.validator = validator
    this.cryptoService = cryptoService
    this.ignoreAndBlockFilterService = ignoreAndBlockFilterService
    this.maxSignaturesNumber = maxSignaturesNumber

    this.transport.addOnIncomingTransactionsCallback((transactions) => {
      this.handleIncomingTransactions(transactions)
    })
  }

  public createTransaction (creator: User, type: string, model: TransactionModel): Transaction {
    const hash = this.cryptoService.calculateTransactionHash(creator, type, model)
    const transaction = new Transaction(creator, type, model, hash)
    this.validator.validateSpecific(this.getTransactions(), transaction)

    return transaction
  }

  public getTransactions (removeIgnored: boolean = false): Transaction[] {
    const allTransactions = this.storageService.getTransactions()
    if (!removeIgnored) {
      return allTransactions
    }
    return this.ignoreAndBlockFilterService.filterIgnored(allTransactions)
  }

  public signAndSend (sender: AuthenticatedUser, transaction: Transaction) {
    const signedTx = this.cryptoService.signTransaction(sender, transaction)
    this.transport.send([signedTx])
    this.handleIncomingTransactions([signedTx])
  }

  public addOnNewTransactionsCallback (callback: (newTransactions: Transaction[], storedTransactions: Transaction[]) => void) {
    this.onNewTransactionsCallbacks.push(callback)
  }

  public broadcastTransactions () {
    const storedTransactions = this.storageService.getTransactions()
    this.transport.send(storedTransactions)
  }

  public filterAndStoreStoredTransactions (): void {
    const storedTransactions = this.storageService.getTransactions()
    const filteredTransactions = this.ignoreAndBlockFilterService.filterBlocked(storedTransactions)
    this.storageService.replaceAllTransactions(filteredTransactions)
  }

  private handleIncomingTransactions (incomingTransactions: Transaction[]) {
    const storedTransactions = this.storageService.getTransactions()
    const transactionsToStore: Transaction[] = []

    incomingTransactions = this.ignoreAndBlockFilterService.filterBlocked(incomingTransactions)

    for (const incomingTx of incomingTransactions) {
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
          this.validator.validateBase(storedTransactions, incomingTx)
        } catch (e) {
          console.error('Incoming transaction is invalid by base rules', e, incomingTx)
          continue
        }

        try {
          this.validator.validateSpecific(storedTransactions, incomingTx)
          transactionsToStore.push(incomingTx)
          storedTransactions.push(incomingTx)
        } catch (e) {
          console.error('Incoming transaction is invalid by specific rules', e, incomingTx)
        }
      }
    }

    if (transactionsToStore.length) {
      const newStoredTransactions = this.storageService.storeTransactions(transactionsToStore)
      if (newStoredTransactions.length) {
        this.notifyContextAboutNewTransactions(newStoredTransactions, storedTransactions)
      }
    }
  }

  private updateStoredTransactionFromIncoming (storedTx: Transaction, incomingTx: Transaction) {
    const signatures = storedTx.signatures.concat(incomingTx.signatures)
    const publicKeys: any = {}
    let uniqueSignatures: Signature[] = []
    for (const signature of signatures) {
      if (!publicKeys[signature.publicKey]) {
        publicKeys[signature.publicKey] = true
        uniqueSignatures.push(signature)
      }
    }
    if (this.maxSignaturesNumber > 0) {
      uniqueSignatures = uniqueSignatures.slice(0, this.maxSignaturesNumber)
    }
    if (uniqueSignatures.length > storedTx.signatures.length) {
      this.storageService.storeTransactionSignatures(storedTx, uniqueSignatures)
    }
  }

  private notifyContextAboutNewTransactions (newTransactions: Transaction[], storedTransactions: Transaction[]) {
    newTransactions = this.ignoreAndBlockFilterService.filterIgnored(newTransactions)
    storedTransactions = this.ignoreAndBlockFilterService.filterIgnored(storedTransactions)
    for (const callback of this.onNewTransactionsCallbacks) {
      callback(newTransactions, storedTransactions)
    }
  }
}
