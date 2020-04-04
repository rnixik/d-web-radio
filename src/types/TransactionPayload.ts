import { UserRegistrationPayload } from '@/models/TransactionPayloads/UserRegistrationPayload'
import { PostUrlPayload } from '@/models/TransactionPayloads/PostUrlPayload'

type TransactionPayload = UserRegistrationPayload | PostUrlPayload

export { TransactionPayload }
