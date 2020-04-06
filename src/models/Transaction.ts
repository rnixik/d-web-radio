import { TransactionType } from '@/enums/TransactionType'
import { TransactionPayload } from '@/types/TransactionPayload'
import { Signature } from '@/models/Signature'

export class Transaction {
  public type: TransactionType
  public payload: TransactionPayload
  public hash: string
  public storedAt?: string
  public signatures: Signature[] = []

  constructor (type: TransactionType, payload: TransactionPayload, hash: string) {
    this.type = type
    this.payload = payload
    this.hash = hash
  }
}
