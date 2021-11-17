import { prop, getModelForClass, Ref } from '@typegoose/typegoose'
import { Module } from '../module/module.model'

export class Permission {
  @prop()
  public name!: string

  @prop({ ref: () => Module, required: true })
  public module!: Ref<Module>
}

export const PermissionModel = getModelForClass(Permission)
