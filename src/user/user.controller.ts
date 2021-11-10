import { hash } from 'argon2'
import { CreateUserInput } from './user.inputs'
import { UserModel } from './user.model'
export class UserController {
  public static createUser = async (user: CreateUserInput) => {
    user.password = await hash(user.password)
    return await UserModel.create(user)
  }
}
