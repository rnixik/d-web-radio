import { ModelSerializer } from '@/types/ModelSerializer'
import { TransactionModel } from '@/types/TransactionModel'
import { User } from '@/models/User'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'

export class YouTubeUrlSerializer implements ModelSerializer {
  modelToPayload (model: YouTubeUrlModel, local: boolean): any {
    const data: any = {
      'id': model.videoId
    }
    if (local) {
      data['d'] = model.duration
      data['t'] = model.title
    }

    return data
  }

  fromPayloadToModel (data: any, creator: User, local: boolean): TransactionModel {
    const model = new YouTubeUrlModel(data['id'], creator)

    if (local) {
      if (data['d']) {
        model.duration = data['d']
      }
      if (data['t']) {
        model.title = data['t']
      }
    }

    return model
  }
}
