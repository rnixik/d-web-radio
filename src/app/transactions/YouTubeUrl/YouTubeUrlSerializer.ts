import { ModelSerializer } from 'd-web-core/lib/types/ModelSerializer'
import { TransactionModel } from 'd-web-core/lib/types/TransactionModel'
import { User } from 'd-web-core/lib/models/User'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'

export class YouTubeUrlSerializer implements ModelSerializer {
  modelToPayload (model: YouTubeUrlModel, local: boolean): any {
    const data: any = {
      'id': model.videoId
    }
    if (local) {
      data['d'] = model.duration
      data['t'] = model.title
      data['p'] = model.poster
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
      if (data['p']) {
        model.poster = data['p']
      }
    }

    return model
  }
}
