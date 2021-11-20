import { RefreshTokenModel } from './refresh-token.model';
import { hash } from 'argon2'
import { CreateUserInput } from './user.inputs'
import { UserModel } from './user.model'
import { ServiceController } from '../service/service.controller'
import { NotFoundError } from '../common/errors/not-found.error'
import { resolve, join } from 'path'
import { readFile } from 'fs/promises'
import { sign } from 'jsonwebtoken'
import { randomBytes } from 'crypto'
export class UserController {
  public static createUser = async (user: CreateUserInput, service: string) => {
    await ServiceController.validateDefaultRolesExist(service)
    user.password = await hash(user.password)
    const u = await UserModel.create({ ...user, registeredBy: service })
    const s = await ServiceController.addUserToService(u.id, service)
    return { user: u, service: s }
  }

  public static validateLogin = async (email: string, service: string) => {
    const user = await UserModel.findOne({ email })
    if (!user) throw new NotFoundError('User', { name: 'email', value: email })
    const permissions = await ServiceController.validateUserService(user.id, service)
    return { user: { id: user.id, ...user.identity }, permissions }
  }

  public static signToken = async (payload: string | object | Buffer, service: string) => {
    const path = join(resolve(process.cwd()), 'keys', service)
    const key = await readFile(join(path, 'private.pem'))
    const passphrase = (await readFile(join(path, 'passphrase'))).toString()
    return sign(payload, { key, passphrase }, { expiresIn: '1h', algorithm: 'RS256' })
  }

  public static generateRefreshToken = async (_id: string, ip: string) => {
    const expires = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    const rt = await RefreshTokenModel.create({
      user: _id,
      token: randomBytes(40).toString('hex'),
      expires,
      createdByIp: ip
    })
    return { refreshToken: rt.token, expires }
  }
}
