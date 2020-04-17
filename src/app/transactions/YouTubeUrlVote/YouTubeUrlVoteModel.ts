import { User } from '@/models/User'
import { ModelSerializer } from '@/types/ModelSerializer'
import { YouTubeUrlVoteSerializer } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteSerializer'
import { TransactionModel } from '@/types/TransactionModel'

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
