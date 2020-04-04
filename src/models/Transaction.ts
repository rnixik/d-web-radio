import { TransactionType } from '@/enums/TransactionType'
import { TransactionPayload } from '@/types/TransactionPayload'

export class Transaction {
  public type: TransactionType
  public payload: TransactionPayload
  public hash: string
  public storedAt?: string

  constructor (type: TransactionType, payload: TransactionPayload, hash: string) {
    this.type = type
    this.payload = payload
    this.hash = hash
  }
}
