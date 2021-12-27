import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { Request, Response, Router } from 'express'
import { Routing } from '../common/classes/routing.class'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { ServiceController } from './service.controller'
import { CreateServiceInput } from './service.inputs'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { authAdmin } from '../common/middleware/auth-admin.middleware'
import MongoIdInput from '../common/validators/mongo-id.input'
import { auth } from '../common/middleware/auth-service.middleware'

export class ServiceRouting extends Routing {
  public readonly resource = 'Service'

  public readonly router = Router()

  constructor () {
    super()
    this.initRoutes()
  }

  private initRoutes () {
    this.router.get(`${this.path}/users/`, auth, this.getUsers)
    this.router.post(`${this.path}/auth`, auth, this.serviceLogin)
    this.router.get(`${this.path}s/`, authAdmin, this.queryServices)
    this.router.post(`${this.path}/`, authAdmin, this.createService)
    this.router.post(`${this.path}/auth/:_id`, authAdmin, this.authToService)
  }

  private getUsers = async (request: Request, response: Response) => {
    try {
      const users = await ServiceController.getUsers(request.service._id)
      const message = `Succcessfully queried ${users.length} Users`
      console.log(message)
      return response.status(200).json({ success: true, result: users, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private serviceLogin = (request: Request, response: Response) => {
    const message = `Authenticated ${request.ip} to service with _id ${request.service._id}`
    console.log(message)
    return response.status(200).json({ success: true, result: request.service, message })
  }

  private queryServices = async (request: Request, response: Response) => {
    try {
      const services = await ServiceController.queryServices()
      const message = `Successfully queried ${services.length} services`
      console.log(message)
      return response.status(200).json(services)
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

  private authToService = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(MongoIdInput, request.params)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const message = `Authenticated ${request.ip} to service with _id ${data._id}`
      console.log(message)
      return response.status(200).json({ success: true, result: await ServiceController.authToService(data._id!), message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
