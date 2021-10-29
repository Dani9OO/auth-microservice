import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Role } from '../role/role.model'
import { ServiceUser } from './service-user.model'

class ApiKey {
  @prop()
  public prefix!: string

  @prop()
  public key!: string
}
export class Service {
  @prop({ unique: true })
  public name!: string

  @prop({ ref: () => Role, required: true })
  public defaultRoles?: Ref<Role>[]

  @prop({ ref: () => ServiceUser, required: true })
  public users?: Ref<ServiceUser>[]

  @prop({ type: () => ApiKey })
  public apiKey!: ApiKey
}

export const ServiceModel = getModelForClass(Service)
