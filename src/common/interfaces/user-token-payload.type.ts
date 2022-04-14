import { User } from '../../user/user.model'

export type UserTokenPayload = typeof User.prototype.identity & {
  id: string,
  permissions: Array<string>
}
