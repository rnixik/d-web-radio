import { PayloadSerializer } from '@/types/PayloadSerializer'

export interface TransactionPayload {
  getSerializer(): PayloadSerializer
}
