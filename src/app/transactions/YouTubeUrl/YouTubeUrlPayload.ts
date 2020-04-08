import { TransactionPayload } from '@/types/TransactionPayload'
import { PayloadSerializer } from '@/types/PayloadSerializer'
import { YouTubeUrlPayloadSerializer } from '@/app/transactions/YouTubeUrl/YouTubeUrlPayloadSerializer'

export class YouTubeUrlPayload implements TransactionPayload {
  public videoId: string

  constructor (videoId: string) {
    this.videoId = videoId
  }

  getSerializer (): PayloadSerializer {
    return new YouTubeUrlPayloadSerializer()
  }
}
