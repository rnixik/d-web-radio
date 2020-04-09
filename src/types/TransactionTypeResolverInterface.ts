import { ModelSerializer } from '@/types/ModelSerializer'
import { SpecificValidator } from '@/types/SpecificValidator'

export interface TransactionTypeResolverInterface {
  getPayloadSerializer (transactionType: string): ModelSerializer
  setPayloadSerializer (transactionType: string, payloadSerializer: ModelSerializer): void
  getSpecificValidator (transactionType: string): SpecificValidator
  setSpecificValidator (transactionType: string, specificValidator: SpecificValidator): void
}
