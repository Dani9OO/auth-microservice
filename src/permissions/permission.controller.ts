import { CreatePermissionInput, UpdatePermissionInput, GetPermissionsInput } from './permission.input'
import { ModuleController } from '../module/module.controller'
import { PermissionModel } from '../common/models'
export class PermissionController {
  public static getPermissions = async (service: string, data: GetPermissionsInput) => {
    return data.module
      ? await PermissionModel.find({ service, module: data.module }).sort({ module: 'asc' })
      : await PermissionModel.find({ service }).sort({ module: 'asc' })
  }

  public static createPermission = async (permission: CreatePermissionInput, service: string, skipValidation?: boolean) => {
    if (!skipValidation) await ModuleController.findModule(permission.module, service)
    const p = await PermissionModel.create({ ...permission, service })
    if (!skipValidation) await ModuleController.addPermissionToModule(permission.module, p.id)
    return p.toObject()
  }

  public static updatePermission = async (permission: UpdatePermissionInput) => {
    return await PermissionModel.findByIdAndUpdate(permission._id, { name: permission.name })
  }

  public static deletePermission = async (_id: string, service: string) => {
    const m = await ModuleController.findModule(_id, service)
    await ModuleController.removePermissionFromModule(m._id, _id)
    return await PermissionModel.findByIdAndDelete(_id)
  }
}
