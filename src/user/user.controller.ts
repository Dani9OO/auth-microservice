import { hash } from 'argon2'
import { CreateUserInput } from './user.inputs'
import { UserModel } from './user.model'
import { ServiceController } from '../service/service.controller'
export class UserController {
  public static createUser = async (user: CreateUserInput, service: string) => {
    user.password = await hash(user.password)
    const u = await UserModel.create({ ...user, registeredBy: service })
    const s = await ServiceController.addUserToService(u._id.valueOf(), service)
    return { user: u, service: s }
  }

  public static findUserByEmail = async (email: string) => {
    return await UserModel.findOne({ email })
  }
}
