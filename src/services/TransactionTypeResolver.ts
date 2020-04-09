import { TypeToSerializerMap } from '@/types/TypeToSerializerMap'
import { UserSerializer } from '@/transactions/User/UserSerializer'
import { ModelSerializer } from '@/types/ModelSerializer'
import { UserTransactionType } from '@/transactions/User/UserTransactionType'
import { SpecificValidator } from '@/types/SpecificValidator'
import { TypeToValidatorMap } from '@/types/TypeToValidatorMap'
import { UserValidator } from '@/transactions/User/UserValidator'
import { TransactionTypeResolverInterface } from '@/types/TransactionTypeResolverInterface'

export class TransactionTypeResolver implements TransactionTypeResolverInterface {
  private readonly typeToSerializerMap: TypeToSerializerMap
  private readonly typeToValidatorMap: TypeToValidatorMap

  constructor () {
    this.typeToSerializerMap = {}
    this.typeToSerializerMap[UserTransactionType.t] = new UserSerializer()

    this.typeToValidatorMap = {}
    this.typeToValidatorMap[UserTransactionType.t] = new UserValidator()
  }

  public getPayloadSerializer (transactionType: string): ModelSerializer {
    if (this.typeToSerializerMap[transactionType]) {
      return this.typeToSerializerMap[transactionType]
    }

    throw new Error('Unregistered transaction type: ' + transactionType)
  }

  public setPayloadSerializer (transactionType: string, payloadSerializer: ModelSerializer): void {
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
