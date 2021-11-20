import { prop, Ref, getModelForClass } from '@typegoose/typegoose';
import { User } from './user.model'

export class RefreshToken {
  @prop({ ref: () => User, required: true })
  public user!: Ref<User>

  @prop()
  public token!: string

  @prop()
  public expires!: Date

  @prop({ default: Date.now() })
  public created!: Date

  @prop()
  public createdByIp!: string

  @prop()
  public revoked?: Date

  @prop()
  public revokedByIp?: Date

  @prop()
  public replacedByToken?: string

  public get isExpired () {
    return Date.now() >= this.expires.valueOf()
  }

  public get isActive () {
    return !this.revoked && !this.isExpired
  }
}

export const RefreshTokenModel = getModelForClass(RefreshToken)