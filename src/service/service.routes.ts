import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { Request, Response, Router } from 'express'
import { Routing } from '../common/classes/routing.class'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { ServiceController } from './service.controller'
import { CreateServiceInput } from './service.inputs'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { authAdmin } from '../common/middleware/auth-admin.middleware'
import MongoIdInput from '../common/validators/mongoid'
import { auth } from '../common/middleware/auth-service.middleware'
import { UpdateServiceUserInput } from './service-user.inputs'

export class ServiceRouting extends Routing {
  public readonly resource = 'Service'

  public readonly router = Router()

  constructor () {
    super()
    this.initRoutes()
  }

  private initRoutes () {
    this.router.get(`${this.path}/users/`, auth, this.getUsers)
    // this.router.post(`${this.path}/user/`, au)
    this.router.put(`${this.path}/user/:id`, auth, this.updateUser)
    this.router.post(`${this.path}/auth`, auth, this.serviceLogin)
    this.router.get(`${this.path}s/`, authAdmin, this.queryServices)
    this.router.get(`${this.path}/:id`, this.queryService)
    this.router.post(`${this.path}/`, authAdmin, this.createService)
    this.router.post(`${this.path}/auth/:id`, authAdmin, this.authToService)
  }

  private getUsers = async (request: Request, response: Response) => {
    try {
      const users = await ServiceController.getUsers(request.service.id)
      const message = `Succcessfully queried ${users.length} Users`
      console.log(message)
      return response.status(200).json({ success: true, result: users, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private updateUser = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(UpdateServiceUserInput, { ...request.body, ...request.params })
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const user = await ServiceController.updateUser(data, request.service.id)
      const message = `Updated service user with id "${data.id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: user, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private serviceLogin = (request: Request, response: Response) => {
    const message = `Authenticated ${request.ip} to service with id ${request.service.id}`
    console.log(message)
    return response.status(200).json({ success: true, result: request.service, message })
  }

  private queryServices = async (request: Request, response: Response) => {
    try {
      const services = await ServiceController.queryServices()
      const message = `Successfully queried ${services.length} services`
      console.log(message)
      return response.status(200).json({ success: true, result: services, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private queryService = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(MongoIdInput.Required, request.params)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const { name } = await ServiceController.findServiceById(data.id!)
      const message = `Successfully queried service with id "${data.id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: name, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private createService = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(CreateServiceInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const service = await ServiceController.createService(data)
      const message = `Sucessfully created service with id "${service.id}"`
      return response.status(200).json({ success: true, result: service, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private authToService = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(MongoIdInput.Required, request.params)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const message = `Authenticated ${request.ip} to service with id ${data.id}`
      console.log(message)
      return response.status(200).json({ success: true, result: await ServiceController.authToService(data.id!), message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
