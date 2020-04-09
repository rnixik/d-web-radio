import { ModelSerializer } from '@/types/ModelSerializer'
import { TransactionModel } from '@/types/TransactionModel'
import { User } from '@/models/User'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'

export class YouTubeUrlSerializer implements ModelSerializer {
  modelToPayload (model: YouTubeUrlModel): any {
    return {
      'id': model.videoId
    }
  }

  fromPayloadToModel (data: any, creator: User): TransactionModel {
    return new YouTubeUrlModel(data['id'], creator)
  }
}
