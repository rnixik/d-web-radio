import { Transaction } from '@/models/Transaction'
import { User } from '@/models/User'

export class UserWithTransactions {
  public user: User;
  public transactions: Transaction[];

  constructor (user: User, transactions: Transaction[]) {
    this.user = user
    this.transactions = transactions
  }

  public addTransaction (transaction: Transaction) {
    this.transactions.push(transaction)
  }
}
