export class User {
  public login: string;
  public publicKey: string;
  public privateKey?: string

  constructor (login: string, publicKey: string) {
    this.login = login
    this.publicKey = publicKey
  }
}
