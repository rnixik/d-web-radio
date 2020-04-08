import { TransactionPayload } from '@/types/TransactionPayload'
import { PayloadSerializer } from '@/types/PayloadSerializer'
import { UserRegistrationPayloadSerializer } from '@/transactions/UserRegistration/UserRegistrationPayloadSerializer'

export class UserRegistrationPayload implements TransactionPayload {
  public login: string
  public publicKey: string

  constructor (login: string, publicKey: string) {
    this.login = login
    this.publicKey = publicKey
  }

  public getSerializer (): PayloadSerializer {
    return new UserRegistrationPayloadSerializer()
  }
}
