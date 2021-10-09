import { prop, Ref } from '@typegoose/typegoose'
import { Service } from '../service/service.model'

export class Module {
  @prop({ ref: () => Service, required: true })
  public service!: Ref<Service>

  @prop()
  public name!: string

  @prop()
  public permissions!: string[]
}
