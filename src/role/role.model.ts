import { prop, Ref } from '@typegoose/typegoose'
import { Policy } from '../policy/policy.model'
import { Service } from '../service/service.model'

export class Role {
  @prop({ ref: () => Service, required: true })
  public service!: Ref<Service>

  @prop()
  public name!: string

  @prop({ ref: () => Policy, default: [] })
  public policies!: Ref<Policy>[]

  @prop({ default: false })
  public default!: boolean
}
