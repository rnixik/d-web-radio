import { TransactionPayload } from '@/types/TransactionPayload'
import { Signature } from '@/models/Signature'

export class Transaction {
  public creatorPublicKey: string
  public type: string
  public payload: TransactionPayload
  public hash: string
  public storedAt?: string
  public signatures: Signature[] = []

  constructor (creatorPublicKey: string, type: string, payload: TransactionPayload, hash: string) {
    this.creatorPublicKey = creatorPublicKey
    this.type = type
    this.payload = payload
    this.hash = hash
  }
}
