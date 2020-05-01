import { TransactionModel } from '@/types/TransactionModel'
import { User } from '@/models/User'

export interface ModelSerializer {
  modelToPayload(model: TransactionModel, local: boolean): any
  fromPayloadToModel(payload: any, creator: User, local: boolean): TransactionModel
}
