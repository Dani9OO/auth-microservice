import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { Service } from '../service/service.model'
import { Permission } from '../permissions/permission.model'
import { schemaOptions } from '../common/constants/schema-options'

@modelOptions({ schemaOptions })
export class Module {
  @prop({ ref: () => Service, required: true })
  public service!: Ref<Service>

  @prop()
  public name!: string

  @prop({ ref: () => Permission })
  public permissions!: Ref<Permission>[]
}
