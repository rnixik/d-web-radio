import { PayloadSerializer } from '@/types/PayloadSerializer'
import { SpecificValidator } from '@/types/SpecificValidator'

export interface TransactionTypeResolverInterface {
  getPayloadSerializer (transactionType: string): PayloadSerializer
  setPayloadSerializer (transactionType: string, payloadSerializer: PayloadSerializer): void
  getSpecificValidator (transactionType: string): SpecificValidator
  setSpecificValidator (transactionType: string, specificValidator: SpecificValidator): void
}
