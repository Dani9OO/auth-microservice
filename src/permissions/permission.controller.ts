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
    const p = await PermissionModel.findOne({ id: permission.id!, service })
    if (!p) throw new NotFoundError('Permission', { name: 'id', value: permission.id! })
    p.name = permission.name
    await p.save()
    return p
  }

  public static deletePermission = async (id: string, service: string) => {
    const p = await PermissionModel.findOneAndDelete({ id, service })
    if (!p) throw new NotFoundError('Permission', { name: 'id', value: id })
    await ModuleController.removePermissionFromModule(p.module!.toString(), id)
    await PolicyController.removePermissions([id])
    return p
  }

  public static permissionCleanup = async (module: string, service: string) => {
    const permissions = (await PermissionModel.find({ module, service })).map(p => p.id)
    await PermissionModel.deleteMany({ id: permissions })
    await PolicyController.removePermissions(permissions)
  }
}
