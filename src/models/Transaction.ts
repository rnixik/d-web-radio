import { TransactionType } from '@/enums/TransactionType'
import { TransactionPayload } from '@/types/TransactionPayload'
import { Signature } from '@/models/Signature'

export class Transaction {
  public creatorPublicKey: string
  public type: TransactionType
  public payload: TransactionPayload
  public hash: string
  public storedAt?: string
  public signatures: Signature[] = []

  constructor (creatorPublicKey: string, type: TransactionType, payload: TransactionPayload, hash: string) {
    this.creatorPublicKey = creatorPublicKey
    this.type = type
    this.payload = payload
    this.hash = hash
  }
}
