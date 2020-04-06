import { Transaction } from '@/models/Transaction'
import { TransactionType } from '@/enums/TransactionType'

export class Validator {
  public validate (storedTransactions: Transaction[], tx: Transaction) {
    switch (tx.type) {
      case TransactionType.UserRegistration:
        this.validateUserRegistration(storedTransactions, tx)
        break
    }
  }

  private validateUserRegistration (storedTransactions: Transaction[], tx: Transaction) {
    //
  }
}
