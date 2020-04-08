import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { TransactionPayload } from '@/types/TransactionPayload'
import { Transaction } from '@/models/Transaction'
import { Signature } from '@/models/Signature'

export interface CryptoServiceInterface {
  getUserByLoginAndPassword (login: string, password: string): AuthenticatedUser
  calculateTransactionHash (type: string, payload: TransactionPayload): string
  signTransaction (user: AuthenticatedUser, tx: Transaction): Transaction
  verifySignature (tx: Transaction, signature: Signature): boolean
}
