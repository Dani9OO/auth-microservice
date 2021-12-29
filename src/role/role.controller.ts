import { CreateRoleInput, UpdateRoleInput } from './role.inputs'
import { Types } from 'mongoose'
import { NotFoundError } from '../common/errors/not-found.error'
import { RoleModel } from '../common/models'
import { ServiceController } from '../service/service.controller'
export class RoleController {
  public static getRoles = async (service: string) => {
    return await RoleModel.find({ service }).sort({ name: 'asc' })
  }

  public static getRole = async (_id: string, service: string) => {
    return await RoleModel.findOne({ _id, service }).populate({
      path: 'policies',
      populate: {
        path: 'permissions',
        populate: {
          path: 'module'
        }
      }
    })
  }

  public static createRole = async (role: CreateRoleInput, service: string) => {
    return await RoleModel.create({ ...role, service })
  }

  public static updateRole = async (role: UpdateRoleInput, service: string) => {
    const r = await RoleModel.findOne({ _id: role._id, service })
    if (!r) throw new NotFoundError('Role', { name: '_id', value: role._id! })
    if (role.policies) r.policies = role.policies.map(r => new Types.ObjectId(r))
    if (role.name && r.name !== role.name) r.name = role.name
    if (r.default !== role.default) {
      r.default = role.default
      if (role.default) await ServiceController.addDefaultRole(service, r.id)
      else await ServiceController.removeDefaultRole(service, r.id)
    }
    await r.save()
    return r
  }

  public static deleteRole = async (_id: string, service: string) => {
    const role = await RoleModel.findOneAndDelete({ _id, service })
    await ServiceController.cleanupServicesAndUsers(_id, service)
    return role
  }

  public static cleanupRoles = async (policy: string, service: string) => {
    const p = new Types.ObjectId(policy)
    return await RoleModel.updateMany({ policies: p, service }, { $pull: { policies: p } })
  }
}
