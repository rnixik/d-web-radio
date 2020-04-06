import { Transaction } from '@/models/Transaction'
import { UserRegistrationPayload } from '@/models/TransactionPayloads/UserRegistrationPayload'
import { TransactionType } from '@/enums/TransactionType'
import { User } from '@/models/User'
import { Transport } from '@/services/Transport'
import { StorageService } from '@/services/StorageService'
import { Validator } from '@/services/Validator'
import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { CryptoService } from '@/services/CryptoService'

export class TransactionService {
  private transport: Transport
  private storageService: StorageService
  private validator: Validator
  private cryptoService: CryptoService

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

    this.transport.addOnIncomingTransactionsCallback((sender, transactions) => {
      this.handleIncomingTransactions(sender, transactions)
    })
  }

  public createRegistrationTransaction (publicUser: User): Transaction {
    const payload = new UserRegistrationPayload(publicUser.login, publicUser.publicKey)
    const hash = this.cryptoService.calculateTransactionHash(TransactionType.UserRegistration, payload)

    return new Transaction(TransactionType.UserRegistration, payload, hash)
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

  public signAndSend (sender: AuthenticatedUser, transaction: Transaction) {
    const signedTx = this.cryptoService.signTransaction(sender, transaction)

    this.transport.send(sender.getPublicUser(), signedTx)
  }

  private handleIncomingTransactions (sender: User, transactions: Transaction[]) {
    const storedTransactions = this.storageService.getTransactions()
    for (const tx of transactions) {
      let txWasStored = false
      for (const storedTx of storedTransactions) {
        if (tx.hash === storedTx.hash) {
          this.updateStoredTransactionFromIncoming(storedTx, tx)
          txWasStored = true
          break
        }
      }
      if (!txWasStored) {
        this.validateAndStoreIncomingTransaction(storedTransactions, tx)
      }
    }
  }

  private updateStoredTransactionFromIncoming (storedTx: Transaction, incomingTx: Transaction) {
    console.log('update stored from incoming', incomingTx)
  }

  private validateAndStoreIncomingTransaction (storedTransactions: Transaction[], incomingTx: Transaction) {
    try {
      this.validator.validate(storedTransactions, incomingTx)
      console.info('Incoming transaction is valid', incomingTx)

      this.storageService.storeTransaction(incomingTx)
    } catch (e) {
      console.error('Incoming transaction is invalid', e, incomingTx)
    }
  }
}
