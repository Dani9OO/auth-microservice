import { CreatePermissionInput, UpdatePermissionInput, GetPermissionsInput } from './permission.input'
import { ModuleController } from '../module/module.controller'
import { PermissionModel } from '../common/models'
import { PolicyController } from '../policy/policy.controller'
import { NotFoundError } from '../common/errors/not-found.error'
export class PermissionController {
  public static getPermissions = async (service: string, data: GetPermissionsInput) => {
    return data.module
      ? await PermissionModel.find({ service, module: data.module }).sort({ module: 'asc' })
      : await PermissionModel.find({ service }).sort({ module: 'asc' })
  }

  public static createPermission = async (permission: CreatePermissionInput, service: string, skipValidation?: boolean) => {
    if (!skipValidation) await ModuleController.findModule(permission.module, service)
    const p = await PermissionModel.create({ ...permission, service })
    await ModuleController.addPermissionToModule(permission.module, p.id)
    return p.toObject()
  }

  public static updatePermission = async (permission: UpdatePermissionInput, service: string) => {
    const p = await PermissionModel.findOne({ _id: permission._id!, service })
    if (!p) throw new NotFoundError('Permission', { name: '_id', value: permission._id! })
    p.name = permission.name
    await p.save()
    return p
  }

  public static deletePermission = async (_id: string, service: string) => {
    const p = await PermissionModel.findOneAndDelete({ _id, service })
    if (!p) throw new NotFoundError('Permission', { name: '_id', value: _id })
    await ModuleController.removePermissionFromModule(p.module!.toString(), _id)
    await PolicyController.removePermissions([_id])
    return p
  }

  public static permissionCleanup = async (module: string, service: string) => {
    const permissions = (await PermissionModel.find({ module, service })).map(p => p._id)
    await PermissionModel.deleteMany({ _id: permissions })
    await PolicyController.removePermissions(permissions)
  }
}
