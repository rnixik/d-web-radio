import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { TransactionModel } from '@/types/TransactionModel'
import { Transaction } from '@/models/Transaction'
import { Signature } from '@/models/Signature'
import { User } from '@/models/User'

export interface CryptoServiceInterface {
  getUserByLoginAndPassword (login: string, password: string): AuthenticatedUser
  calculateTransactionHash (creator: User, type: string, payload: TransactionModel): string
  signTransaction (user: AuthenticatedUser, tx: Transaction): Transaction
  verifySignature (tx: Transaction, signature: Signature): boolean
}
