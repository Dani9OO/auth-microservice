import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Role } from '../role/role.model'
import { ServiceUser } from './service-user.model'

export class Service {
  @prop({ unique: true })
  public name!: string

  @prop({ ref: () => Role, required: true })
  public defaultRoles?: Ref<Role>[]

  @prop({ ref: () => ServiceUser, required: true })
  public users?: Ref<ServiceUser>[]
}

export const ServiceModel = getModelForClass(Service)
