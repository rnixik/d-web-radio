import { Transaction } from '@/models/Transaction'
import { User } from '@/models/User'
import { Transport } from '@/services/Transport'
import { StorageService } from '@/services/StorageService'
import { Validator } from '@/services/Validator'
import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { CryptoService } from '@/services/CryptoService'
import { Signature } from '@/models/Signature'
import { TransactionPayload } from '@/types/TransactionPayload'

export class TransactionService {
  private transport: Transport
  private storageService: StorageService
  private validator: Validator
  private cryptoService: CryptoService
  private onNewTransactionsCallbacks: ((transactions: Transaction[]) => void)[] = []

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

  public createTransaction (creator: User, type: string, payload: TransactionPayload): Transaction {
    const hash = this.cryptoService.calculateTransactionHash(type, payload)

    return new Transaction(creator.publicKey, type, payload, hash)
  }

  public getTransactions (): Transaction[] {
    return this.storageService.getTransactions()
  }

  public signAndSend (sender: AuthenticatedUser, transaction: Transaction) {
    const signedTx = this.cryptoService.signTransaction(sender, transaction)

    this.transport.send(signedTx)
  }

  public addOnNewTransactionsCallback (callback: (transactions: Transaction[]) => void) {
    this.onNewTransactionsCallbacks.push(callback)
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
  }
}
