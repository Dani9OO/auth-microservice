import { Router, Response, Request } from 'express'
import { Routing } from '../common/classes/routing.class'
import { CreateModuleInput, UpdateModuleInput } from './module.input'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { ModuleController } from './module.controller'
import { auth } from '../common/middleware/auth-service.middleware'
import MongoIdInput from '../common/validators/mongo-id.input'

export class ModuleRouting extends Routing {
  public readonly resource = 'Module'

  public readonly router = Router()

  constructor () {
    super()
    this.initRoutes()
  }

  private initRoutes () {
    this.router.post(`${this.path}/`, auth, this.create)
    this.router.put(`${this.path}/:_id`, auth, this.update)
    this.router.delete(`${this.path}/:_id`, auth, this.delete)
  }

  private create = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(CreateModuleInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const m = await ModuleController.createModule(request.service._id, data)
      const message = `Created Module with _id "${m._id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: m, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private update = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(UpdateModuleInput, { ...request.body, ...request.params })
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const m = await ModuleController.updateModule(request.service._id, data)
      const message = `Updated Module with _id "${data._id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: m, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private delete = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(MongoIdInput, request.params)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const m = await ModuleController.deleteModule(request.service._id, data._id!)
      const message = `Deleted Module with _id "${data._id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: m, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
