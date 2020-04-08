import { TypeToSerializerMap } from '@/types/TypeToSerializerMap'
import { UserRegistrationPayloadSerializer } from '@/transactions/UserRegistration/UserRegistrationPayloadSerializer'
import { PayloadSerializer } from '@/types/PayloadSerializer'
import { UserRegistrationTransactionType } from '@/transactions/UserRegistration/UserRegistrationTransactionType'
import { SpecificValidator } from '@/types/SpecificValidator'
import { TypeToValidatorMap } from '@/types/TypeToValidatorMap'
import { UserRegistrationValidator } from '@/transactions/UserRegistration/UserRegistrationValidator'
import { TransactionTypeResolverInterface } from '@/types/TransactionTypeResolverInterface'

export class TransactionTypeResolver implements TransactionTypeResolverInterface {
  private readonly typeToSerializerMap: TypeToSerializerMap
  private readonly typeToValidatorMap: TypeToValidatorMap

  constructor () {
    this.typeToSerializerMap = {}
    this.typeToSerializerMap[UserRegistrationTransactionType.t] = new UserRegistrationPayloadSerializer()

    this.typeToValidatorMap = {}
    this.typeToValidatorMap[UserRegistrationTransactionType.t] = new UserRegistrationValidator()
  }

  public getPayloadSerializer (transactionType: string): PayloadSerializer {
    if (this.typeToSerializerMap[transactionType]) {
      return this.typeToSerializerMap[transactionType]
    }

    throw new Error('Unregistered transaction type: ' + transactionType)
  }

  public setPayloadSerializer (transactionType: string, payloadSerializer: PayloadSerializer): void {
    this.typeToSerializerMap[transactionType] = payloadSerializer
  }

  public getSpecificValidator (transactionType: string): SpecificValidator {
    if (this.typeToValidatorMap[transactionType]) {
      return this.typeToValidatorMap[transactionType]
    }

    throw new Error('Unregistered transaction type: ' + transactionType)
  }

  public setSpecificValidator (transactionType: string, specificValidator: SpecificValidator): void {
    this.typeToValidatorMap[transactionType] = specificValidator
  }
}
