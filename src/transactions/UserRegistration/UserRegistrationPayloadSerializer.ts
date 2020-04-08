import { PayloadSerializer } from '@/types/PayloadSerializer'
import { TransactionPayload } from '@/types/TransactionPayload'
import { UserRegistrationPayload } from '@/transactions/UserRegistration/UserRegistrationPayload'

export class UserRegistrationPayloadSerializer implements PayloadSerializer {
  fromDataToPayload (data: any): TransactionPayload {
    return new UserRegistrationPayload(data['l'], data['pk'])
  }

  payloadToData (payload: UserRegistrationPayload): any {
    return {
      'l': payload.login,
      'pk': payload.publicKey
    }
  }
}
