import { Routing } from '../common/classes/routing.class'
import { Request, Response, Router } from 'express'
import { plainToClass } from 'class-transformer'
import { CreatePermissionInput, UpdatePermissionInput } from './permission.input'
import { validate } from 'class-validator'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { PermissionController } from './permission.controller'
import { auth } from '../common/middleware/auth-service.middleware'
import MongoIdInput from '../common/validators/mongo-id.input'
export class PermissionRouting extends Routing {
  public readonly resource = 'Permission'

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
      const data = plainToClass(CreatePermissionInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const p = await PermissionController.createPermission(data, request.service._id)
      const message = `Permission ${data.name} for module ${data.module} successfully created`
      console.log(message)
      return response.status(200).json({ success: true, result: p, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private update = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(UpdatePermissionInput, { ...request.body, ...request.params })
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const p = await PermissionController.updatePermission(data, request.service._id)
      const message = `Updated Permission with _id "${data._id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: p, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private delete = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(MongoIdInput, request.params)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const p = await PermissionController.deletePermission(data._id!, request.service._id)
      const message = `Deleted Permission with _id "${data._id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: p, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
