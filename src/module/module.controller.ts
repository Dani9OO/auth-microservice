import { CreateModuleInput, UpdateModuleInput } from './module.input'
import { ModuleModel } from './module.model'
export class ModuleController {
  public static createModule = async (service: string, m: CreateModuleInput) => {
    return await ModuleModel.create({ service, ...m })
  }

  public static updateModule = async (service: string, m: UpdateModuleInput) => {
    const _id = m._id
    delete m._id
    return await ModuleModel.findOneAndUpdate({ _id, service }, m)
  }

  public static deleteModule = async (service: string, _id: string) => {
    return await ModuleModel.findOneAndDelete({ _id, service })
  }
}
