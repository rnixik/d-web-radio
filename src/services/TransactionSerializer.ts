import { Transaction } from '@/models/Transaction'
import { TransactionModel } from '@/types/TransactionModel'
import { Signature } from '@/models/Signature'
import { TransactionSerializerInterface } from '@/types/TransactionSerializerInterface'
import { TransactionTypeResolverInterface } from '@/types/TransactionTypeResolverInterface'
import { User } from '@/models/User'

export class TransactionSerializer implements TransactionSerializerInterface {
  private readonly transactionTypeResolver: TransactionTypeResolverInterface

  constructor (transactionTypeResolver: TransactionTypeResolverInterface) {
    this.transactionTypeResolver = transactionTypeResolver
  }

  public dataToTransaction (data: any, local: boolean): Transaction {
    if (!data['u']) {
      throw new Error('Empty creator key')
    }

    if (!data['u']['l']) {
      throw new Error('Empty creator login')
    }

    if (!data['u']['pk']) {
      throw new Error('Empty creator public key')
    }

    if (!data['t']) {
      throw new Error('Empty type')
    }

    if (!data['p']) {
      throw new Error('Empty model payload')
    }

    if (!data['h']) {
      throw new Error('Empty hash')
    }

    const creator = new User(data['u']['l'], data['u']['pk'])
    const type: string = data['t']
    const payloadSerializer = this.transactionTypeResolver.getPayloadSerializer(type)
    const model: TransactionModel = payloadSerializer.fromPayloadToModel(data['p'], creator)

    const tx = new Transaction(creator, type, model, data['h'])

    if (data['s']) {
      for (const signatureData of data['s']) {
        tx.signatures.push(new Signature(signatureData['sg'], signatureData['pk']))
      }
    }

    if (local && data['d']) {
      tx.storedAt = new Date(data['d'])
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
      'u': {
        'l': transaction.creator.login,
        'pk': transaction.creator.publicKey
      },
      't': transaction.type,
      'p': payloadSerializer.modelToPayload(transaction.model),
      'h': transaction.hash,
      's': signatures
    }

    if (local && transaction.storedAt) {
      data['d'] = transaction.storedAt.toISOString()
    }

    return data
  }
}
