import { CreateModuleInput, UpdateModuleInput } from './module.input'
import { ModuleModel } from './module.model'
import { NotFoundError } from '../common/errors/not-found.error'
import { PermissionController } from '../permissions/permission.controller'
export class ModuleController {
  public static findModule = async (m: string, service: string) => {
    const moduleDoc = await ModuleModel.findOne({ _id: m, service }).lean()
    if (!moduleDoc) throw new NotFoundError('Module', { name: '_id', value: m })
    return moduleDoc
  }

  public static createModule = async (service: string, m: CreateModuleInput) => {
    const moduleDoc = await ModuleModel.create({ service, name: m.name })
    const permissions = await Promise.all(m.permissions.map(p => PermissionController.createPermission({ module: moduleDoc._id.valueOf(), name: p }, service, true)))
    moduleDoc.permissions = permissions.map(p => p._id.valueOf())
    await moduleDoc.save()
    return moduleDoc
  }

  public static updateModule = async (service: string, m: UpdateModuleInput) => {
    return await ModuleModel.findOneAndUpdate({ _id: m._id, service }, { name: m.name })
  }

  public static deleteModule = async (service: string, _id: string) => {
    return await ModuleModel.findOneAndDelete({ _id, service })
  }

  public static addPermissionToModule = async (m: string, permission: string) => {
    await ModuleModel.findByIdAndUpdate(m, { $push: { permissions: permission } })
  }

  public static removePermissionFromModule = async (m: string, permission: string) => {
    await ModuleModel.findByIdAndUpdate(m, { $pull: { permissions: permission } })
  }
}
