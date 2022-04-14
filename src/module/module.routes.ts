import { Router, Response, Request } from 'express'
import { Routing } from '../common/classes/routing.class'
import { CreateModuleInput, UpdateModuleInput } from './module.inputs'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { ModuleController } from './module.controller'
import { auth } from '../common/middleware/auth-service.middleware'
import MongoIdInput from '../common/validators/mongoid'

export class ModuleRouting extends Routing {
  public readonly resource = 'Module'

  public readonly router = Router()

  constructor () {
    super()
    this.initRoutes()
  }

  private initRoutes () {
    this.router.post(`${this.path}/`, auth, this.create)
    this.router.get(`${this.path}s/`, auth, this.read)
    this.router.put(`${this.path}/:id`, auth, this.update)
    this.router.delete(`${this.path}/:id`, auth, this.delete)
  }

  private read = async (request: Request, response: Response) => {
    try {
      const modules = await ModuleController.getModules(request.service.id)
      const message = `Successfully queried ${modules.length} Modules`
      console.log(message)
      return response.status(200).json({ success: true, result: modules, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private create = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(CreateModuleInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const m = await ModuleController.createModule(request.service.id, data)
      const message = `Created Module with id "${m.id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: m, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private update = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(UpdateModuleInput, { ...request.body, ...request.params })
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const m = await ModuleController.updateModule(request.service.id, data)
      const message = `Updated Module with id "${data.id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: m, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private delete = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(MongoIdInput.Required, request.params)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const m = await ModuleController.deleteModule(request.service.id, data.id!)
      const message = `Deleted Module with id "${data.id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: m, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
