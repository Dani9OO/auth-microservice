import randomatic from 'randomatic'
import { join, resolve } from 'path'
import { mkdir, writeFile, readFile, chmod } from 'fs/promises'
import generateKeypair from '../common/functions/generate-keypair.function'
import { CreateServiceInput } from './service.inputs'
import { hash } from 'argon2'
import { NotFoundError } from '../common/errors/not-found.error'
import { ResponseError } from '../common/errors/response.error'
import { isDocumentArray, DocumentType, isDocument } from '@typegoose/typegoose'
import { Policy } from '../policy/policy.model'
import { ServiceModel, ServiceUserModel } from '../common/models'
import { randomBytes } from 'crypto'
import { Types } from 'mongoose'

export class ServiceController {
  public static queryServices = async () => {
    return await ServiceModel.find()
  }

  public static createService = async (service: CreateServiceInput) => {
    const [prefix, key] = [await this.getUniquePrefix(), randomatic('Aa00!!', 32)]
    const apiKey = `${prefix}.${key}`
    const hashedKey = await hash(key)
    const s = await ServiceModel.create({ ...service, apiKey: { prefix, key: hashedKey } })
    if (!s) throw new Error('Failed to create a new service due to an unexpected server error')
    const passphrase = randomatic('Aa00!!', 16)
    const { publicKey, privateKey } = await generateKeypair(passphrase)
    const path = join(resolve(process.cwd()), 'keys', s.id)
    const paths = {
      private: join(path, 'private.pem'),
      public: join(path, 'public.pem'),
      passphrase: join(path, 'passphrase'),
      api: join(path, 'apikey')
    }
    await mkdir(path, { recursive: true })
    await Promise.all([
      writeFile(paths.private, privateKey),
      writeFile(paths.public, publicKey),
      writeFile(paths.passphrase, passphrase),
      writeFile(paths.api, apiKey)
    ])
    await Promise.all([
      chmod(paths.private, 0o700),
      chmod(paths.public, 0o700),
      chmod(paths.passphrase, 0o700),
      chmod(paths.api, 0o700)
    ])
    return { _id: s._id, apiKey, passphrase, publicKey }
  }

  public static authToService = async (service: string) => {
    return (await readFile(join(resolve(process.cwd()), 'keys', service, 'apikey'))).toString()
  }

  private static getUniquePrefix = async () => {
    const prefixes = (await ServiceModel.find()).map(s => s.apiKey.prefix)
    let prefix = randomatic('Aa0', 7)
    while (prefixes.some(p => p === prefix)) prefix = randomatic('Aa0', 7)
    return prefix
  }

  public static findServiceById = async (_id: string) => {
    return await ServiceModel.findById(_id)
  }

  public static findServiceByPrefix = async (prefix: string) => {
    return await ServiceModel.findOne({ 'apiKey.prefix': prefix })
  }

  public static addUserToService = async (user: string, service: string) => {
    const s = await ServiceModel.findById(service)
    if (!s) throw new NotFoundError('Service', { name: '_id', value: service })
    const u = new ServiceUserModel({ user, roles: s.defaultRoles, service })
    if (!s.users) s.users = [u.id]; else s.users.push(u.id)
    await s.save()
    u.verificationToken = { token: randomBytes(40).toString('hex') }
    await u.save()
    return { user: u, service: s, token: u.verificationToken.token }
  }

  public static removeUserFromService = async (user: string, service: string) => {
    const u = await ServiceUserModel.findOneAndDelete({ user, service })
    if (!u) throw new NotFoundError('User Service', { name: 'user, service', value: `${user}", "${service}` })
    await ServiceModel.findByIdAndUpdate(service, { $pull: { users: u.id } })
    return u.toObject()
  }

  public static validateDefaultRolesExist = async (_id: string) => {
    const service = await ServiceModel.findById(_id)
    if (!service) throw new NotFoundError('Service', { name: '_id', value: _id })
    if (!service.defaultRoles || !(service.defaultRoles.length > 0)) throw new ResponseError('Default service roles must be defined before registering an user')
  }

  public static validateUserService = async (user: string, service: string) => {
    const u = await ServiceUserModel.findOne({ user, service }).populate({
      path: 'roles',
      populate: {
        path: 'policies',
        populate: {
          path: 'permissions',
          populate: {
            path: 'module'
          }
        }
      }
    })
    if (!u) throw new NotFoundError('User Service', { name: 'user, service', value: `${user}", "${service}` })
    const policiesWithNoDuplicates: { [k: string]: DocumentType<Policy> } = {}
    if (isDocumentArray(u.roles)) {
      u.roles.forEach(r => {
        if (isDocumentArray(r.policies)) {
          r.policies.forEach(p => { if (!policiesWithNoDuplicates[p._id]) policiesWithNoDuplicates[p._id] = p })
        }
      })
    }
    const permissions: string[] = []
    Object.values(policiesWithNoDuplicates).forEach(pol => {
      if (isDocumentArray(pol.permissions)) {
        pol.permissions.forEach(p => {
          if (isDocument(p.module)) {
            permissions.push(`${p.module.name}.${p.name}`)
          }
        })
      }
    })
    return permissions
  }

  public static verifyEmail = async (service: string, token: string) => {
    const serviceUser = await ServiceUserModel.findOne({ service, 'verificationToken.token': token }).populate('user')
    if (!serviceUser) throw new NotFoundError('Service user', { name: 'token', value: token })
    serviceUser.verificationToken!.verified = new Date()
    delete serviceUser.verificationToken!.token
    await serviceUser.save()
    if (!isDocument(serviceUser.user)) throw new ResponseError('Couldn\'t populate user')
    return serviceUser.user.email
  }

  public static addDefaultRole = async (service: string, role: string) => {
    const s = await ServiceModel.findByIdAndUpdate(service, { $addToSet: { defaultRoles: role } })
    if (!s) throw new NotFoundError('Service', { name: '_id', value: service })
  }

  public static removeDefaultRole = async (service: string, role: string) => {
    const s = await ServiceModel.findByIdAndUpdate(service, { $pull: { defaultRoles: role } })
    if (!s) throw new NotFoundError('Service', { name: '_id', value: service })
  }

  public static getUsers = async (service: string) => {
    const users = await ServiceUserModel.find({ service }).populate('user')
    if (!users) throw new NotFoundError('Service user', { name: '_id', value: service })
    return users
  }

  public static cleanupServicesAndUsers = async (role: string, service: string) => {
    const r = new Types.ObjectId(role)
    await ServiceUserModel.updateMany({ roles: r, service }, { $pull: { roles: r } })
    await ServiceModel.updateOne({ _id: service, defaultRoles: r }, { $pull: { defaultRoles: r } })
  }
}
