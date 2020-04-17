import { ModelSerializer } from '@/types/ModelSerializer'
import { TransactionModel } from '@/types/TransactionModel'
import { User } from '@/models/User'
import { YouTubeUrlVoteModel } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteModel'

export class YouTubeUrlVoteSerializer implements ModelSerializer {
  modelToPayload (model: YouTubeUrlVoteModel): any {
    return {
      'id': model.videoId,
      'p': model.isPositive ? 1 : 0
    }
  }

  fromPayloadToModel (data: any, creator: User): TransactionModel {
    return new YouTubeUrlVoteModel(data['id'], creator, data['p'] === 1)
  }
}
