import { modelOptions, prop, Ref } from '@typegoose/typegoose'
import { schemaOptions } from '../common/constants/schema-options'
import { Module } from '../module/module.model'
import { Service } from '../service/service.model'

@modelOptions({ schemaOptions })
export class Permission {
  @prop()
  public name!: string

  @prop({ ref: () => Module, required: true })
  public module!: Ref<Module>

  @prop({ ref: () => Service, required: true })
  public service!: Ref<Service>
}

// export const PermissionModel = getModelForClass(Permission)
