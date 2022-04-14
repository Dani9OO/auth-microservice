import { CreatePolicyInput, UpdatePolicyInput } from './policy.inputs'
import { Types } from 'mongoose'
import { NotFoundError } from '../common/errors/not-found.error'
import { PolicyModel } from '../common/models'
import { RoleController } from '../role/role.controller'
export class PolicyController {
  public static getPolicies = async (service: string) => {
    return await PolicyModel.find({ service }).sort({ name: 'asc' })
  }

  public static createPolicy = async (policy: CreatePolicyInput, service: string) => {
    return await PolicyModel.create({ ...policy, service })
  }

  public static updatePolicy = async (policy: UpdatePolicyInput, service: string) => {
    const p = await PolicyModel.findOne({ id: policy.id, service })
    if (!p) throw new NotFoundError('Policy', { name: 'id', value: policy.id! })
    if (policy.permissions) p.permissions = policy.permissions.map(p => new Types.ObjectId(p))
    if (policy.name && p.name !== policy.name) p.name = policy.name
    await p.save()
    return p
  }

  public static deletePolicy = async (id: string, service: string) => {
    const p = await PolicyModel.findOneAndDelete({ id, service })
    if (!p) throw new NotFoundError('Policy', { name: 'id', value: id })
    await RoleController.cleanupRoles(id, service)
    return p
  }

  public static removePermissions = async (permissionIds: string[]) => {
    const permissions = permissionIds.map(p => new Types.ObjectId(p))
    return await PolicyModel.updateMany({ permissions }, { $pull: { permissions: { $in: permissions } } })
  }
}
