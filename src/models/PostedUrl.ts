import { User } from '@/models/User'

export class PostedUrl {
  public url: string;
  public user: User

  constructor (url: string, user: User) {
    this.url = url
    this.user = user
  }
}
