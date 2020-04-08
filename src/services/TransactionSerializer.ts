import { Transaction } from '@/models/Transaction'
import { TransactionType } from '@/enums/TransactionType'
import { UserRegistrationPayload } from '@/models/TransactionPayloads/UserRegistrationPayload'
import { TransactionPayload } from '@/types/TransactionPayload'
import { Signature } from '@/models/Signature'
import { PostUrlPayload } from '@/models/TransactionPayloads/PostUrlPayload'

export class TransactionSerializer {
  public dataToTransaction (data: any, local: boolean): Transaction {
    if (!data['k']) {
      throw new Error('Empty creator public key')
    }

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
        payload = new UserRegistrationPayload(data['p']['login'], data['p']['publicKey'])
        break
      case TransactionType.PostUrl:
        payload = new PostUrlPayload(data['p']['url'])
        break
      default:
        throw new Error('Unknown type: ' + type)
    }

    const tx = new Transaction(data['k'], type, payload, data['h'])

    if (data['s']) {
      for (const signatureData of data['s']) {
        tx.signatures.push(new Signature(signatureData['sg'], signatureData['pk']))
      }
    }

    if (local && data['d']) {
      tx.storedAt = data['d']
    }

    return tx
  }

  public transactionToData (transaction: Transaction, local: boolean): any {
    const signatures = []
    for (const signature of transaction.signatures) {
      signatures.push({
        'sg': signature.signature,
        'pk': signature.publicKey
      })
    }

    const data: any = {
      'k': transaction.creatorPublicKey,
      't': transaction.type,
      'p': transaction.payload,
      'h': transaction.hash,
      's': signatures
    }

    if (local) {
      data['d'] = transaction.storedAt
    }

    return data
  }
}
