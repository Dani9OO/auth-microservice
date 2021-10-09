import { Module } from '../module/module.model'
import { Ref, prop } from '@typegoose/typegoose'
import { Policy } from './policy.model'

export class PolicyPermissions {
  @prop({ ref: () => Module, required: true })
  public policy: Ref<Policy>

  @prop({ ref: () => Module, required: true })
  public module: Ref<Module>

  @prop()
  public permissions!: number[]
}
