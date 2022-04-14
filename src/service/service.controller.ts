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
import { Types } from 'mongoose'
import { UpdateServiceUserInput } from './service-user.inputs'
import { DuplicatedError } from '../common/errors/duplicated.error'

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
    return s
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

  public static findServiceById = async (id: string) => {
    const s = await ServiceModel.findById(id)
    if (!s) throw new NotFoundError('Service', { name: 'id', value: id })
    return s
  }

  public static findServiceByPrefix = async (prefix: string) => {
    return await ServiceModel.findOne({ 'apiKey.prefix': prefix })
  }

  public static addUserToService = async (user: string, service: string) => {
    const exists = await ServiceUserModel.findOne({ user: user })
    if (exists) throw new DuplicatedError('User', { name: 'id', value: user! })
    const s = await ServiceModel.findById(service)
    if (!s) throw new NotFoundError('Service', { name: 'id', value: service })
    const u = new ServiceUserModel({ user, roles: s.defaultRoles, service })
    if (!s.users) s.users = [u.id]
    else s.users.push(u.id)
    await s.save()
    await u.save()
    return { user: u, service: s }
  }

  public static removeUserFromService = async (user: string, service: string) => {
    const u = await ServiceUserModel.findOneAndDelete({ user, service })
    if (!u) throw new NotFoundError('User Service', { name: 'user, service', value: `${user}", "${service}` })
    await ServiceModel.findByIdAndUpdate(service, { $pull: { users: u.id } })
    return u.toObject()
  }

  public static validateDefaultRolesExist = async (id: string) => {
    const service = await ServiceModel.findById(id)
    if (!service) throw new NotFoundError('Service', { name: 'id', value: id })
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
          r.policies.forEach(p => { if (!policiesWithNoDuplicates[p.id]) policiesWithNoDuplicates[p.id] = p })
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

  public static addDefaultRole = async (service: string, role: string) => {
    const s = await ServiceModel.findByIdAndUpdate(service, { $addToSet: { defaultRoles: role } })
    if (!s) throw new NotFoundError('Service', { name: 'id', value: service })
  }

  public static removeDefaultRole = async (service: string, role: string) => {
    const s = await ServiceModel.findByIdAndUpdate(service, { $pull: { defaultRoles: role } })
    if (!s) throw new NotFoundError('Service', { name: 'id', value: service })
  }

  public static getUsers = async (service: string) => {
    const users = await ServiceUserModel.find({ service }).populate('user')
    if (!users) throw new NotFoundError('Service user', { name: 'id', value: service })
    return users
  }

  public static cleanupServicesAndUsers = async (role: string, service: string) => {
    const r = new Types.ObjectId(role)
    await ServiceUserModel.updateMany({ roles: r, service }, { $pull: { roles: r } })
    await ServiceModel.updateOne({ id: service, defaultRoles: r }, { $pull: { defaultRoles: r } })
  }

  public static updateUser = async (user: UpdateServiceUserInput, service: string) => {
    const u = await ServiceUserModel.findOne({ id: user.id, service })
    if (!u) throw new NotFoundError('Service user', { name: 'id', value: user.id! })
    if (user.roles) u.roles = user.roles.map(r => new Types.ObjectId(r))
    if (u.disabled !== user.disabled) u.disabled = user.disabled
    await u.save()
    return u
  }
}
