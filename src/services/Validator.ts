import { Transaction } from '@/models/Transaction'
import { TransactionType } from '@/enums/TransactionType'
import { UserRegistrationPayload } from '@/models/TransactionPayloads/UserRegistrationPayload'
import { CryptoService } from '@/services/CryptoService'
import { PostUrlPayload } from '@/models/TransactionPayloads/PostUrlPayload'

export class Validator {
  private cryptoService: CryptoService

  constructor (cryptoService: CryptoService) {
    this.cryptoService = cryptoService
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
    switch (tx.type) {
      case TransactionType.UserRegistration:
        this.validateUserRegistration(storedTransactions, tx)
        break
      case TransactionType.PostUrl:
        this.validatePostUrl(storedTransactions, tx)
        break
    }
  }

  private validateUserRegistration (storedTransactions: Transaction[], tx: Transaction) {
    for (const storedTx of storedTransactions) {
      if (storedTx.type !== TransactionType.UserRegistration) {
        continue
      }
      const storedPayload = storedTx.payload as UserRegistrationPayload
      const payload = tx.payload as UserRegistrationPayload
      if (storedPayload.publicKey === payload.publicKey) {
        throw new Error('User already registered')
      }
    }
  }

  private validatePostUrl (storedTransactions: Transaction[], tx: Transaction) {
    for (const storedTx of storedTransactions) {
      if (storedTx.type !== TransactionType.PostUrl) {
        continue
      }
      const storedPayload = storedTx.payload as PostUrlPayload
      const payload = tx.payload as PostUrlPayload
      if (storedPayload.url === payload.url) {
        throw new Error('Url already posted')
      }
    }
  }
}
