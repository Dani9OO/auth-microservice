import { prop, Ref } from '@typegoose/typegoose'
import { Permission } from '../permissions/permission.model'

export class Policy {
  @prop()
  public name!: string

  @prop({ ref: () => Permission, required: true })
  public permissions!: Ref<Permission>[]
}
