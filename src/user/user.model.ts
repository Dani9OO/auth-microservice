import { getModelForClass, prop } from '@typegoose/typegoose'

class User {
  @prop()
  forename!: string

  @prop()
  surname!: string

  @prop()
  username!: string

  @prop()
  email!: string
}

export const UserModel = getModelForClass(User)
