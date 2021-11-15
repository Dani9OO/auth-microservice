import { prop, Ref, getModelForClass } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { Service } from '../service/service.model'

export class Module {
  @prop({ ref: () => Service, required: true })
  public service!: Ref<Service>

  @prop()
  public name!: string

  @prop()
  public permissions!: Types.Array<string>
}

export const ModuleModel = getModelForClass(Module)
