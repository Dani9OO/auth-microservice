import { hash, verify } from 'argon2'
import { CreateUserInput, ForgotPasswordInput, ResetPasswordInput } from './user.inputs'
import { ServiceController } from '../service/service.controller'
import { NotFoundError } from '../common/errors/not-found.error'
import { resolve, join } from 'path'
import { readFile } from 'fs/promises'
import { sign } from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { UserModel, RefreshTokenModel } from '../common/models'
import { ResponseError } from '../common/errors/response.error'
import { isDocument } from '@typegoose/typegoose'
import { DuplicatedError } from '../common/errors/duplicated.error'
export class UserController {
  public static createUser = async (user: CreateUserInput, service: string) => {
    const u = await UserModel.findOne({ email: user.email })
    if (!u) throw new DuplicatedError('User', { name: 'email', value: user.email })
    user.password = await hash(user.password)
    const newUser = await UserModel.create({ ...user, services: [service], verification: { token: randomBytes(40).toString('hex') } })
    const { user: serviceUser, service: s } = await ServiceController.addUserToService(newUser.id, service)
    return { user: newUser.identity, service: { id: s.id, name: s.name, user: serviceUser.id, token: newUser.verification.token } }
  }

  public static findUserById = async (id: string) => {
    return await UserModel.findById(id)
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

  public static generateRefreshToken = async (id: string, ip: string) => {
    const expires = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    const rt = await RefreshTokenModel.create({
      user: id,
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

  public static verifyEmail = async (service: string, token: string) => {
    const user = await UserModel.findOne({ 'verificationToken.token': token })
    if (!user) throw new NotFoundError('User', { name: 'token', value: token })
    user.verification!.verified = new Date()
    delete user.verification!.token
    await user.save()
    return user.email
  }

  public static forgotPassword = async (user: ForgotPasswordInput) => {
    const u = await UserModel.findOne({ email: user.email })
    if (!u) return undefined
    u.resetToken = { token: randomBytes(40).toString('hex'), expires: new Date(Date.now() + 60 * 60 * 1000) }
    await u.save()
    return { ...u.identity, token: u.resetToken.token }
  }

  public static resetPassword = async (user: ResetPasswordInput) => {
    const u = await UserModel.findOne({ 'resetToken.token': user.token, 'resetToken.expires': { $gt: Date.now() } })
    if (!u) throw new ResponseError('Invalid token, please try resetting your password again')
    u.password = await hash(user.password)
    delete u.resetToken
    await u.save()
    return u.email
  }

  public static authorizeService = async (user: string, service: string) => {
    await ServiceController.addUserToService(user, service)
  }
}
