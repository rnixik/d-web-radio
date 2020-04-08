import { Transaction } from '@/models/Transaction'
import { TransactionPayload } from '@/types/TransactionPayload'
import { Signature } from '@/models/Signature'
import { TransactionTypeResolver } from '@/services/TransactionTypeResolver'

export class TransactionSerializer {
  private readonly transactionTypeResolver: TransactionTypeResolver

  constructor (transactionTypeResolver: TransactionTypeResolver) {
    this.transactionTypeResolver = transactionTypeResolver
  }

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

    const type: string = data['t']

    const payloadSerializer = this.transactionTypeResolver.getPayloadSerializer(type)
    const payload: TransactionPayload = payloadSerializer.fromDataToPayload(data['p'])

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

    const payloadSerializer = this.transactionTypeResolver.getPayloadSerializer(transaction.type)

    const data: any = {
      'k': transaction.creatorPublicKey,
      't': transaction.type,
      'p': payloadSerializer.payloadToData(transaction.payload),
      'h': transaction.hash,
      's': signatures
    }

    if (local) {
      data['d'] = transaction.storedAt
    }

    return data
  }
}
