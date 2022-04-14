import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { schemaOptions } from '../common/constants/schema-options'
import { Permission } from '../permissions/permission.model'
import { Service } from '../service/service.model'

@modelOptions({ schemaOptions })
export class Policy {
  @prop({ ref: () => Service, required: true })
  public service!: Ref<Service>

  @prop()
  public name!: string

  @prop({ ref: () => Permission, required: true })
  public permissions!: Ref<Permission>[]
}
