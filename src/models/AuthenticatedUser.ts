import { User } from '@/models/User'

export class AuthenticatedUser {
  public login: string;
  public publicKey: string;
  public privateKey: string

  constructor (login: string, publicKey: string, privateKey: string) {
    this.login = login
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  public getPublicUser (): User {
    return new User(this.login, this.publicKey)
  }
}
