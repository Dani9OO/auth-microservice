import { prop } from '@typegoose/typegoose'

export class ResetToken {
  @prop()
  public token!: string

  @prop()
  public expires!: Date

  @prop()
  public reset?: Date
}
