import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { User } from '@/models/User'

export interface UserServiceInterface {
  register (login: string, password: string): AuthenticatedUser
  login (login: string, password: string): AuthenticatedUser
  getUserByPublicKey (publicKey: string): User | null
}
