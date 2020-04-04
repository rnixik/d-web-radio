export class Url {
  private url: string;

  constructor (url: string) {
    this.url = url
  }

  public toJson (): string {
    return JSON.stringify({
      'url': this.url
    })
  }
}
