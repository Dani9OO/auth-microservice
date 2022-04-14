import { prop, Ref } from '@typegoose/typegoose'
import { Role } from '../role/role.model'
import { User } from '../user/user.model'
import { Service } from './service.model'

export class ServiceUser {
  @prop({ ref: () => User, required: true })
  public user!: Ref<User>

  @prop({ ref: () => Service, required: true })
  public service!: Ref<Service>

  @prop({ ref: () => Role, required: true })
  public roles!: Ref<Role>[]

  @prop({ default: false })
  public disabled!: boolean
}
