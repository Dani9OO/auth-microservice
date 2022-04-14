import { CreateRoleInput, UpdateRoleInput } from './role.inputs'
import { Types } from 'mongoose'
import { NotFoundError } from '../common/errors/not-found.error'
import { RoleModel } from '../common/models'
import { ServiceController } from '../service/service.controller'
export class RoleController {
  public static getRoles = async (service: string) => {
    return await RoleModel.find({ service }).sort({ name: 'asc' })
  }

  public static getRole = async (id: string, service: string) => {
    return await RoleModel.findOne({ id, service }).populate({
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
    const r = await RoleModel.create({ ...role, service })
    if (role.default) ServiceController.addDefaultRole(service, r.id)
    return r
  }

  public static updateRole = async (role: UpdateRoleInput, service: string) => {
    const r = await RoleModel.findOne({ id: role.id, service })
    if (!r) throw new NotFoundError('Role', { name: 'id', value: role.id! })
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

  public static deleteRole = async (id: string, service: string) => {
    const role = await RoleModel.findOneAndDelete({ id, service })
    await ServiceController.cleanupServicesAndUsers(id, service)
    return role
  }

  public static cleanupRoles = async (policy: string, service: string) => {
    const p = new Types.ObjectId(policy)
    return await RoleModel.updateMany({ policies: p, service }, { $pull: { policies: p } })
  }
}
