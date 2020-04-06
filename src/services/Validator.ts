import { Transaction } from '@/models/Transaction'
import { TransactionType } from '@/enums/TransactionType'
import { UserRegistrationPayload } from '@/models/TransactionPayloads/UserRegistrationPayload'
import { CryptoService } from '@/services/CryptoService'

export class Validator {
  private cryptoService: CryptoService

  constructor (cryptoService: CryptoService) {
    this.cryptoService = cryptoService
  }

  public validate (storedTransactions: Transaction[], tx: Transaction) {
    const hash = this.cryptoService.calculateTransactionHash(tx.type, tx.payload)

    if (hash !== tx.hash) {
      throw new Error('Invalid hash')
    }

    switch (tx.type) {
      case TransactionType.UserRegistration:
        this.validateUserRegistration(storedTransactions, tx)
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
}
