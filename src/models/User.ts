import { TransactionModel } from '@/types/TransactionModel'
import { ModelSerializer } from '@/types/ModelSerializer'
import { UserSerializer } from '@/transactions/User/UserSerializer'

export class User implements TransactionModel {
  public login: string;
  public publicKey: string;

  constructor (login: string, publicKey: string) {
    this.login = login
    this.publicKey = publicKey
  }

  getSerializer (): ModelSerializer {
    return new UserSerializer()
  }
}
