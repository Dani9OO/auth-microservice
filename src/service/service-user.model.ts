import { prop, Ref } from '@typegoose/typegoose'
import { Role } from '../role/role.model'
import { User } from '../user/user.model'
import { VerificationToken } from './verification-token.model'

export class ServiceUser {
  @prop({ ref: () => User, required: true })
  public user!: Ref<User>

  @prop({ ref: () => Role, required: true })
  public roles!: Ref<Role>[]

  @prop({ ref: () => VerificationToken })
  public verificationToken?: Ref<VerificationToken>
}
