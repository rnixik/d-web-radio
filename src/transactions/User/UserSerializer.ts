import { ModelSerializer } from '@/types/ModelSerializer'
import { TransactionModel } from '@/types/TransactionModel'
import { User } from '@/models/User'

export class UserSerializer implements ModelSerializer {
  modelToPayload (payload: User): any {
    return {
      'l': payload.login,
      'pk': payload.publicKey
    }
  }

  fromPayloadToModel (data: any, creator: User): TransactionModel {
    return new User(data['l'], data['pk'])
  }
}
