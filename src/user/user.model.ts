import { getModelForClass, prop, Ref, modelOptions } from '@typegoose/typegoose'
import { ResetToken } from './reset-token.model'
import { VerificationToken } from './verification-token.model'

@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
})
export class User {
  @prop()
  forename!: string

  @prop()
  surname!: string

  @prop({ unique: true })
  email!: string

  @prop()
  username!: string

  @prop()
  password!: string

  @prop({ ref: () => VerificationToken })
  verificationToken?: Ref<VerificationToken>

  @prop({ ref: () => ResetToken })
  resetToken?: Ref<ResetToken>

  @prop({ default: Date.now() })
  created!: Date

  @prop({ default: Date.now() })
  updated!: Date
}

export const UserModel = getModelForClass(User)
