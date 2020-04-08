import { PayloadSerializer } from '@/types/PayloadSerializer'
import { TransactionPayload } from '@/types/TransactionPayload'
import { YouTubeUrlPayload } from '@/app/transactions/YouTubeUrl/YouTubeUrlPayload'

export class YouTubeUrlPayloadSerializer implements PayloadSerializer {
  fromDataToPayload (data: any): TransactionPayload {
    return new YouTubeUrlPayload(data['u'])
  }

  payloadToData (payload: YouTubeUrlPayload): any {
    return {
      'u': payload.url
    }
  }
}
