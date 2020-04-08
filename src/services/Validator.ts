import { Transaction } from '@/models/Transaction'
import { CryptoService } from '@/services/CryptoService'
import { TransactionTypeResolver } from '@/services/TransactionTypeResolver'

export class Validator {
  private cryptoService: CryptoService
  private transactionTypeResolver: TransactionTypeResolver

  constructor (cryptoService: CryptoService, transactionTypeResolver: TransactionTypeResolver) {
    this.cryptoService = cryptoService
    this.transactionTypeResolver = transactionTypeResolver
  }

  public validateBase (storedTransactions: Transaction[], tx: Transaction) {
    const hash = this.cryptoService.calculateTransactionHash(tx.type, tx.payload)

    if (hash !== tx.hash) {
      throw new Error('Invalid hash')
    }

    if (tx.signatures.length === 0) {
      throw new Error('No signatures')
    }

    if (tx.signatures[0].publicKey !== tx.creatorPublicKey) {
      throw new Error('Wrong first signature')
    }

    for (const signature of tx.signatures) {
      if (!this.cryptoService.verifySignature(tx, signature)) {
        throw new Error('Invalid signature')
      }
    }
  }

  public validateSpecific (storedTransactions: Transaction[], tx: Transaction) {
    const specificValidator = this.transactionTypeResolver.getSpecificValidator(tx.type)
    specificValidator.validate(storedTransactions, tx)
  }
}
