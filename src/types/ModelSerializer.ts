import { TransactionModel } from '@/types/TransactionModel'
import { User } from '@/models/User'

export interface ModelSerializer {
  modelToPayload(model: TransactionModel): any
  fromPayloadToModel(payload: any, creator: User): TransactionModel
}
