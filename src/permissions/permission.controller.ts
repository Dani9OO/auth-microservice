import { CreatePermissionInput, UpdatePermissionInput } from './permission.input'
import { PermissionModel } from './permission.model'
import { ModuleController } from '../module/module.controller'
export class PermissionController {
  public static createPermission = async (permission: CreatePermissionInput, service: string, skipValidation?: boolean) => {
    if (!skipValidation) await ModuleController.findModule(permission.module, service)
    const p = await PermissionModel.create(permission)
    if (!skipValidation) await ModuleController.addPermissionToModule(permission.module, p._id.valueOf())
    return p.toObject()
  }

  public static updatePermission = async (permission: UpdatePermissionInput, service: string) => {
    await ModuleController.findModule(permission.module!, service)
    return await PermissionModel.findByIdAndUpdate(permission._id, { name: permission.name })
  }

  public static deletePermission = async (_id: string, service: string) => {
    const m = await ModuleController.findModule(_id, service)
    await ModuleController.removePermissionFromModule(m._id, _id)
    return await PermissionModel.findByIdAndDelete(_id)
  }
}
