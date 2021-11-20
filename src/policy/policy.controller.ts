import { CreatePolicyInput, UpdatePolicyInput } from './policy.inputs'
import { Types } from 'mongoose'
import { NotFoundError } from '../common/errors/not-found.error'
import { PolicyModel } from '../common/models'
export class PolicyController {
  public static getPolicies = async (service: string) => {
    return await PolicyModel.find({ service }).sort({ name: 'asc' }).populate({ path: 'permissions', populate: { path: 'module' } }).lean()
  }

  public static createPolicy = async (policy: CreatePolicyInput, service: string) => {
    return await PolicyModel.create({ ...policy, service })
  }

  public static updatePolicy = async (policy: UpdatePolicyInput, service: string) => {
    const p = await PolicyModel.findOne({ _id: policy._id, service })
    if (!p) throw new NotFoundError('Policy', { name: '_id', value: policy._id! })
    if (policy.permissions) p.permissions = policy.permissions.map(p => new Types.ObjectId(p))
    if (policy.name && p.name !== policy.name) p.name = policy.name
    await p.save()
    return p
  }

  public static deletePolicy = async (_id: string, service: string) => {
    return await PolicyModel.findOneAndDelete({ _id, service })
  }
}
