import { AuthenticatedUser } from '@/models/AuthenticatedUser'

export interface UserServiceInterface {
  register (login: string, password: string): Promise<AuthenticatedUser>
  login (login: string, password: string): AuthenticatedUser
}
