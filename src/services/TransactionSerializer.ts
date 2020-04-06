import { Transaction } from '@/models/Transaction'
import { TransactionType } from '@/enums/TransactionType'
import { UserRegistrationPayload } from '@/models/TransactionPayloads/UserRegistrationPayload'
import { TransactionPayload } from '@/types/TransactionPayload'

export class TransactionSerializer {
  public dataToTransaction (data: any): Transaction {
    if (!data['t']) {
      throw new Error('Empty type')
    }

    if (!data['p']) {
      throw new Error('Empty payload')
    }

    if (!data['h']) {
      throw new Error('Empty hash')
    }

    let type: TransactionType

    try {
      type = data['t'] as TransactionType
    } catch (e) {
      throw new Error('Cannot cast type ' + data['t'] + ': ' + e.toString())
    }

    let payload: TransactionPayload

    switch (type) {
      case TransactionType.UserRegistration:
        payload = this.getUserRegistrationPayload(data['p'])
        break
      default:
        throw new Error('Unknown type: ' + type)
    }

    return new Transaction(type, payload, data['h'])
  }

  public transactionToData (transaction: Transaction): any {
    return {
      't': transaction.type,
      'p': transaction.payload,
      'h': transaction.hash
    }
  }

  private getUserRegistrationPayload (payloadData: any): UserRegistrationPayload {
    return new UserRegistrationPayload(payloadData['login'], payloadData['publicKey'])
  }
}
