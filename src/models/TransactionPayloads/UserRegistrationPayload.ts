export class UserRegistrationPayload {
  public login: string
  public publicKey: string

  constructor (login: string, publicKey: string) {
    this.login = login
    this.publicKey = publicKey
  }
}
