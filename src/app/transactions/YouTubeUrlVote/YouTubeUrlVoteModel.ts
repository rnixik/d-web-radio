import { User } from 'd-web-core/lib/models/User'
import { ModelSerializer } from 'd-web-core/lib/types/ModelSerializer'
import { YouTubeUrlVoteSerializer } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteSerializer'
import { TransactionModel } from 'd-web-core/lib/types/TransactionModel'

export class YouTubeUrlVoteModel implements TransactionModel {
  public videoId: string;
  public user: User
  public isPositive: boolean;

  constructor (videoId: string, user: User, isPositive: boolean) {
    this.videoId = videoId
    this.user = user
    this.isPositive = isPositive
  }

  getSerializer (): ModelSerializer {
    return new YouTubeUrlVoteSerializer()
  }
}
