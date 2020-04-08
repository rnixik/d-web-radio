import { TransactionPayload } from '@/types/TransactionPayload'

export interface PayloadSerializer {
  payloadToData(payload: TransactionPayload): any
  fromDataToPayload(data: any): TransactionPayload
}
