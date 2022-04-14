import { Routing } from '../common/classes/routing.class'
import { Request, Response, Router } from 'express'
import { plainToClass } from 'class-transformer'
import { CreatePermissionInput, UpdatePermissionInput, GetPermissionsInput } from './permission.input'
import { validate } from 'class-validator'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { PermissionController } from './permission.controller'
import { auth } from '../common/middleware/auth-service.middleware'
import MongoIdInput from '../common/validators/mongoid'
export class PermissionRouting extends Routing {
  public readonly resource = 'Permission'

  public readonly router = Router()

  constructor () {
    super()
    this.initRoutes()
  }

  private initRoutes () {
    this.router.get(`${this.path}s/`, auth, this.read)
    this.router.post(`${this.path}/`, auth, this.create)
    this.router.put(`${this.path}/:id`, auth, this.update)
    this.router.delete(`${this.path}/:id`, auth, this.delete)
  }

  private read = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(GetPermissionsInput, request.query)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const permissions = await PermissionController.getPermissions(request.service.id, data)
      const message = `Successfully queried ${permissions.length} Permissions`
      console.log(message)
      return response.status(200).json({ success: true, result: permissions, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private create = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(CreatePermissionInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const p = await PermissionController.createPermission(data, request.service.id)
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
      const p = await PermissionController.updatePermission(data, request.service.id)
      const message = `Updated Permission with id "${data.id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: p, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private delete = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(MongoIdInput.Required, request.params)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const p = await PermissionController.deletePermission(data.id!, request.service.id)
      const message = `Deleted Permission with id "${data.id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: p, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
