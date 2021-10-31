import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { Request, Response, Router } from 'express'
import { ModuleRouting } from '../common/classes/module-routing.class'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { ServiceController } from './service.controller'
import { CreateServiceInput } from './service.inputs'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { authAdmin } from '../common/middleware/auth-admin.middleware'

export class ServiceRouting implements ModuleRouting {
  public readonly path = '/service'

  public readonly router = Router()

  constructor () {
    this.initRoutes()
  }

  private initRoutes () {
    this.router.get(`${this.path}/`, authAdmin, this.queryServices)
    this.router.post(`${this.path}/`, authAdmin, this.createService)
  }

  private queryServices = async (request: Request, response: Response) => {
    try {
      const services = await ServiceController.queryServices()
      if (!(services.length > 0)) {
        const error = new Error('There are no registered services on the database')
        console.error(error)
        return response.status(404).json({ success: false, message: error.message })
      }
      const message = `Successfully queried ${services.length} services`
      console.log(message)
      return response.status(200).json({ success: true, result: services, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private createService = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(CreateServiceInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const service = await ServiceController.createService(data)
      const message = `Sucessfully created service with _id "${service._id}"`
      return response.status(200).json({ success: true, result: { ...service }, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
