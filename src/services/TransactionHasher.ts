import { CryptoService } from '@/services/CryptoService'
import { TransactionPayload } from '@/types/TransactionPayload'
import { TransactionType } from '@/enums/TransactionType'

export class TransactionHasher {
  private cryptoService: CryptoService

  constructor (cryptoService: CryptoService) {
    this.cryptoService = cryptoService
  }

  public calculateHash (type: TransactionType, payload: TransactionPayload): string {
    const str = JSON.stringify([type, payload])

    return this.cryptoService.hash(str)
  }
}
