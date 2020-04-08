import { User } from '@/models/User'

export class YouTubeUrlModel {
  public videoId: string;
  public user: User

  constructor (videoId: string, user: User) {
    this.videoId = videoId
    this.user = user
  }

  public getYouTubeUrl (): string {
    return 'https://www.youtube.com/embed/' + this.videoId + '?autoplay=0'
  }
}
