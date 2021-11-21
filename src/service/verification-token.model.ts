import { prop } from '@typegoose/typegoose'

export class VerificationToken {
  @prop()
  public token!: string

  @prop()
  public verified?: Date
}
