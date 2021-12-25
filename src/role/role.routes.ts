import { Routing } from '../common/classes/routing.class'
import { Request, Response, Router } from 'express'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { auth } from '../common/middleware/auth-service.middleware'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import MongoIdInput from '../common/validators/mongo-id.input'
import { RoleController } from './role.controller'
import { CreateRoleInput, UpdateRoleInput } from './role.inputs'
import { NotFoundError } from '../common/errors/not-found.error'
export class RoleRouting extends Routing {
  public readonly resource = 'Role'

  public readonly router = Router()

  constructor () {
    super()
    this.initRoutes()
  }

  private initRoutes () {
    this.router.post(`${this.path}/`, auth, this.create)
    this.router.get(`${this.path}s/`, auth, this.read)
    this.router.get(`${this.path}/:_id`, auth, this.details)
    this.router.put(`${this.path}/:_id`, auth, this.update)
    this.router.delete(`${this.path}/:_id`, auth, this.delete)
  }

  private create = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(CreateRoleInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const role = await RoleController.createRole(data, request.service._id)
      const message = `Role ${data.name} successfully created`
      console.log(message)
      return response.status(200).json({ success: true, result: role, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private read = async (request: Request, response: Response) => {
    try {
      const roles = await RoleController.getRoles(request.service._id)
      const message = `Successfully queried ${roles.length} Roles`
      console.log(message)
      return response.status(200).json({ success: true, result: roles, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private details = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(MongoIdInput, request.params)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const role = await RoleController.getRole(data._id!, request.service._id)
      if (!role) return response.status(404).json(new NotFoundError(this.resource, { name: '_id', value: data._id! }).respond())
      const message = `Successfully queried ${this.resource} with _id "${data._id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: role, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private update = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(UpdateRoleInput, { ...request.body, ...request.params })
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const role = await RoleController.updateRole(data, request.service._id)
      const message = `Updated Role with _id "${data._id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: role, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private delete = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(MongoIdInput, request.params)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const role = await RoleController.deleteRole(data._id!, request.service._id)
      const message = `Deleted Role with _id "${data._id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: role, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
