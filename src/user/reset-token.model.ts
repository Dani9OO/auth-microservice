import { modelOptions, prop } from '@typegoose/typegoose'
import { schemaOptions } from '../common/constants/schema-options'

@modelOptions({ schemaOptions })
export class ResetToken {
  @prop()
  public token!: string

  @prop()
  public expires!: Date

  @prop()
  public reset?: Date
}
