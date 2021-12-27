import { CreatePermissionInput, UpdatePermissionInput, GetPermissionsInput } from './permission.input'
import { ModuleController } from '../module/module.controller'
import { PermissionModel } from '../common/models'
import { PolicyController } from '../policy/policy.controller'
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

  public static updatePermission = async (permission: UpdatePermissionInput) => {
    return await PermissionModel.findByIdAndUpdate(permission._id, { name: permission.name })
  }

  public static deletePermission = async (_id: string, service: string) => {
    const m = await ModuleController.findModule(_id, service)
    await ModuleController.removePermissionFromModule(m._id, _id)
    await PolicyController.removePermissions([_id])
    return await PermissionModel.findByIdAndDelete(_id)
  }

  public static permissionCleanup = async (module: string, service: string) => {
    const permissions = (await PermissionModel.find({ module, service })).map(p => p._id)
    await PermissionModel.deleteMany({ _id: permissions })
    await PolicyController.removePermissions(permissions)
  }
}
