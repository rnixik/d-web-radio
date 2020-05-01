import { User } from '@/models/User'
import { ModelSerializer } from '@/types/ModelSerializer'
import { YouTubeUrlSerializer } from '@/app/transactions/YouTubeUrl/YouTubeUrlSerializer'
import { TransactionModel } from '@/types/TransactionModel'

export class YouTubeUrlModel implements TransactionModel {
  public videoId: string
  public user: User
  public duration: number | null = null
  public title: string | null = null

  constructor (videoId: string, user: User) {
    this.videoId = videoId
    this.user = user
  }

  getSerializer (): ModelSerializer {
    return new YouTubeUrlSerializer()
  }

  public getYouTubeUrl (): string {
    return 'https://www.youtube.com/embed/' + this.videoId + '?autoplay=0'
  }
}
