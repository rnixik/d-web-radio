import { TransactionModel } from '@/types/TransactionModel'
import { Signature } from '@/models/Signature'
import { User } from '@/models/User'

export class Transaction {
  public creator: User
  public type: string
  public model: TransactionModel
  public hash: string
  public storedAt?: string
  public signatures: Signature[] = []

  constructor (creator: User, type: string, model: TransactionModel, hash: string) {
    this.creator = creator
    this.type = type
    this.model = model
    this.hash = hash
  }
}
