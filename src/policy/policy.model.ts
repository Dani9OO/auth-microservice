import { prop, Ref } from '@typegoose/typegoose'
import { PolicyPermissions } from './policy-permissions.model'

export class Policy {
  @prop()
  public name!: string

  @prop({ ref: () => PolicyPermissions, required: true })
  public permissions!: Ref<PolicyPermissions>[]
}
