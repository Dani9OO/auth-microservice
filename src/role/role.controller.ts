import { CreateRoleInput, UpdateRoleInput } from './role.inputs'
import { RoleModel } from './role.model'
import { Types } from 'mongoose'
import { NotFoundError } from '../common/errors/not-found.error'
export class RoleController {
  public static getRoles = async (service: string) => {
    return await RoleModel.find({ service }).sort({ name: 'asc' }).lean()
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
    }).lean()
  }

  public static createRole = async (role: CreateRoleInput, service: string) => {
    return await RoleModel.create({ ...role, service })
  }

  public static updateRole = async (role: UpdateRoleInput, service: string) => {
    const r = await RoleModel.findOne({ _id: role._id, service })
    if (!r) throw new NotFoundError('Role', { name: '_id', value: role._id! })
    if (role.policies) r.policies = role.policies.map(r => new Types.ObjectId(r))
    if (role.name && r.name !== role.name) r.name = role.name
    await r.save()
    return r
  }

  public static deleteRole = async (_id: string, service: string) => {
    return await RoleModel.findOneAndDelete({ _id, service })
  }
}