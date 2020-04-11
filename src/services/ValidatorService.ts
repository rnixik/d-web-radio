import { Transaction } from '@/models/Transaction'
import { CryptoServiceInterface } from '@/types/CryptoServiceInterface'
import { ValidatorServiceInterface } from '@/types/ValidatorServiceInterface'
import { TransactionTypeResolverInterface } from '@/types/TransactionTypeResolverInterface'
import { User } from '@/models/User'
import { UserTransactionType } from '@/transactions/User/UserTransactionType'

export class ValidatorService implements ValidatorServiceInterface {
  private cryptoService: CryptoServiceInterface
  private transactionTypeResolver: TransactionTypeResolverInterface

  constructor (cryptoService: CryptoServiceInterface, transactionTypeResolver: TransactionTypeResolverInterface) {
    this.cryptoService = cryptoService
    this.transactionTypeResolver = transactionTypeResolver
  }

  public validateBase (storedTransactions: Transaction[], tx: Transaction): void {
    const hash = this.cryptoService.calculateTransactionHash(tx.creator, tx.type, tx.model)

    if (hash !== tx.hash) {
      throw new Error('Invalid hash')
    }

    if (tx.signatures.length === 0) {
      throw new Error('No signatures')
    }

    if (tx.signatures[0].publicKey !== tx.creator.publicKey) {
      throw new Error('Wrong first signature')
    }

    if (tx.type !== UserTransactionType.t) {
      const storedUser = this.getUserByPublicKey(storedTransactions, tx.creator.publicKey)
      if (!storedUser) {
        throw new Error('Creator of transactions not found')
      }
      if (storedUser.login !== tx.creator.login) {
        throw new Error('Login mismatch of creator')
      }
    }

    for (const signature of tx.signatures) {
      if (!this.cryptoService.verifySignature(tx, signature)) {
        throw new Error('Invalid signature')
      }
    }
  }

  public validateSpecific (storedTransactions: Transaction[], tx: Transaction): void {
    const specificValidator = this.transactionTypeResolver.getSpecificValidator(tx.type)
    specificValidator.validate(storedTransactions, tx)
  }

  private getUserByPublicKey (storedTransactions: Transaction[], publicKey: string): User | null {
    for (const tx of storedTransactions) {
      if (tx.type !== UserTransactionType.t) {
        continue
      }
      const user = tx.model as User
      if (user.publicKey === publicKey) {
        return user
      }
    }

    return null
  }
}
