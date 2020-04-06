import { Transaction } from '@/models/Transaction'
import { TransactionType } from '@/enums/TransactionType'
import { UserRegistrationPayload } from '@/models/TransactionPayloads/UserRegistrationPayload'
import { TransactionPayload } from '@/types/TransactionPayload'
import { Signature } from '@/models/Signature'

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

    const tx = new Transaction(type, payload, data['h'])

    if (data['s']) {
      for (const signatureData of data['s']) {
        tx.signatures.push(new Signature(signatureData['sg'], signatureData['pk']))
      }
    }

    return tx
  }

  public transactionToData (transaction: Transaction): any {
    const signatures = []
    for (const signature of transaction.signatures) {
      signatures.push({
        'sg': signature.signature,
        'pk': signature.publicKey
      })
    }

    return {
      't': transaction.type,
      'p': transaction.payload,
      'h': transaction.hash,
      's': signatures
    }
  }

  private getUserRegistrationPayload (payloadData: any): UserRegistrationPayload {
    return new UserRegistrationPayload(payloadData['login'], payloadData['publicKey'])
  }
}
