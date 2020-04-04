import { Transaction } from '@/models/Transaction'
import { TransactionType } from '@/enums/TransactionType'
import { UserRegistrationPayload } from '@/models/TransactionPayloads/UserRegistrationPayload'
import { TransactionPayload } from '@/types/TransactionPayload'

export class TransactionSerializer {
  public dataToTransaction (data: any): Transaction {
    if (!data['type']) {
      throw new Error('Empty type')
    }

    if (!data['payload']) {
      throw new Error('Empty payload')
    }

    if (!data['hash']) {
      throw new Error('Empty hash')
    }

    let type: TransactionType

    try {
      type = data['type'] as TransactionType
    } catch (e) {
      throw new Error('Cannot cast type ' + data['type'] + ': ' + e.toString())
    }

    let payload: TransactionPayload

    switch (type) {
      case TransactionType.UserRegistration:
        payload = this.getUserRegistrationPayload(data['payload'])
        break
      default:
        throw new Error('Unknown type: ' + type)
    }

    return new Transaction(type, payload, data['hash'])
  }

  public transactionToData (transaction: Transaction): any {
    return []
  }

  private getUserRegistrationPayload (payloadData: any): UserRegistrationPayload {
    return new UserRegistrationPayload(payloadData['login'], payloadData['publicKey'])
  }
}
