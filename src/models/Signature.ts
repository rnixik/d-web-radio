export class Signature {
  public signature: string;
  public publicKey: string;

  constructor (signature: string, publicKey: string) {
    this.signature = signature
    this.publicKey = publicKey
  }
}
