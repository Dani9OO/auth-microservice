import { CreateModuleInput, UpdateModuleInput } from './module.inputs'
import { NotFoundError } from '../common/errors/not-found.error'
import { PermissionController } from '../permissions/permission.controller'
import { ModuleModel } from '../common/models'
export class ModuleController {
  public static getModules = async (service: string) => {
    return await ModuleModel.find({ service }).sort({ name: 'asc' }).populate('permissions')
  }

  public static findModule = async (m: string, service: string) => {
    const moduleDoc = await ModuleModel.findOne({ _id: m, service })
    if (!moduleDoc) throw new NotFoundError('Module', { name: '_id', value: m })
    return moduleDoc
  }

  public static createModule = async (service: string, m: CreateModuleInput) => {
    const moduleDoc = await ModuleModel.create({ service, name: m.name })
    const permissions = await Promise.all(m.permissions.map(p => PermissionController.createPermission({ module: moduleDoc.id, name: p }, service, true)))
    moduleDoc.permissions = permissions.map(p => p.id)
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
