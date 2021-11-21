import { prop, Ref, modelOptions } from '@typegoose/typegoose'
import { ResetToken } from './reset-token.model'
import { Service } from '../service/service.model'

@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
})
export class User {
  @prop()
  public forename!: string

  @prop()
  public surname!: string

  @prop({ unique: true })
  public email!: string

  @prop()
  public username!: string

  @prop()
  public password!: string

  @prop({ type: () => ResetToken, _id: false })
  public resetToken?: ResetToken

  @prop({ default: Date.now() })
  public created!: Date

  @prop({ default: Date.now() })
  public updated!: Date

  @prop({ ref: () => Service })
  public services!: Ref<Service>[]

  public get identity () {
    return {
      forename: this.forename,
      surname: this.surname,
      email: this.email,
      username: this.username
    }
  }
}
