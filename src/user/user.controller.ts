import { hash, verify } from 'argon2'
import { CreateUserInput } from './user.inputs'
import { ServiceController } from '../service/service.controller'
import { NotFoundError } from '../common/errors/not-found.error'
import { resolve, join } from 'path'
import { readFile } from 'fs/promises'
import { sign } from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { UserModel, RefreshTokenModel } from '../common/models'
import { ResponseError } from '../common/errors/response.error'
import { isDocument } from '@typegoose/typegoose'
export class UserController {
  public static createUser = async (user: CreateUserInput, service: string) => {
    await ServiceController.validateDefaultRolesExist(service)
    const u = await UserModel.findOne({ email: user.email })
    if (!u) {
      user.password = await hash(user.password)
      const newUser = await UserModel.create({ ...user, services: [service] })
      const { user: serviceUser, service: s, token } = await ServiceController.addUserToService(newUser.id, service)
      return { user: newUser.identity, service: { id: s.id, name: s.name, user: serviceUser.id, token } }
    } else {
      const { user: serviceUser, service: s, token } = await ServiceController.addUserToService(u.id, service)
      return { user: u.identity, service: { id: s.id, name: s.name, user: serviceUser.id, token } }
    }
  }

  public static findUserById = async (_id: string) => {
    return await UserModel.findById(_id)
  }

  public static findRefreshToken = async (user: string, token: string) => {
    return await RefreshTokenModel.findOne({ user, token })
  }

  public static validateLogin = async (email: string, pass: string, service: string, ip: string) => {
    const user = await UserModel.findOne({ email })
    if (!user) throw new NotFoundError('User', { name: 'email', value: email })
    if (!await verify(pass, user.password)) {
      throw new ResponseError(`Unsuccessfull login attempt from ${ip} to user ${email}`, 'Incorrect password')
    }
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

  public static refreshToken = async (token: string, service: string, ip: string) => {
    const rt = await RefreshTokenModel.findOne({ token }).populate('user')
    if (!rt || !rt.isActive || !isDocument(rt.user)) throw new ResponseError('Invalid refresh token')
    const { refreshToken, expires } = await this.generateRefreshToken(rt.user.id, ip)
    rt.revoked = new Date()
    rt.revokedByIp = ip
    rt.replacedByToken = refreshToken
    await rt.save()
    const permissions = await ServiceController.validateUserService(rt.user.id, service)
    return { user: { id: rt.user.id, ...rt.user.identity }, permissions, refreshToken, expires }
  }

  public static logout = async (token: string, ip: string) => {
    const rt = await RefreshTokenModel.findOne({ token })
    if (!rt || !rt.isActive) throw new ResponseError('Invalid refresh token')
    rt.revoked = new Date()
    rt.revokedByIp = ip
    await rt.save()
  }
}
