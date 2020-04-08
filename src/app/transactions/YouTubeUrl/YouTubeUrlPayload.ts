import { TransactionPayload } from '@/types/TransactionPayload'
import { PayloadSerializer } from '@/types/PayloadSerializer'
import { YouTubeUrlPayloadSerializer } from '@/app/transactions/YouTubeUrl/YouTubeUrlPayloadSerializer'

export class YouTubeUrlPayload implements TransactionPayload {
  public url: string

  constructor (url: string) {
    this.url = url
  }

  getSerializer (): PayloadSerializer {
    return new YouTubeUrlPayloadSerializer()
  }
}
