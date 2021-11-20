import { Routing } from '../common/classes/routing.class'
import { Request, Response, Router } from 'express'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { auth } from '../common/middleware/auth-service.middleware'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import MongoIdInput from '../common/validators/mongo-id.input'
import { PolicyController } from './policy.controller'
import { CreatePolicyInput, UpdatePolicyInput } from './policy.inputs'
export class PolicyRouting extends Routing {
  public readonly resource = 'Policy'

  public readonly router = Router()

  constructor () {
    super()
    this.initRoutes()
  }

  private initRoutes () {
    this.router.post(`${this.path}/`, auth, this.create)
    this.router.get(`${this.path}/`, auth, this.read)
    this.router.put(`${this.path}/:_id`, auth, this.update)
    this.router.delete(`${this.path}/:_id`, auth, this.delete)
  }

  private create = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(CreatePolicyInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const p = await PolicyController.createPolicy(data, request.service._id)
      const message = `Policy ${data.name} successfully created`
      console.log(message)
      return response.status(200).json({ success: true, result: p, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private read = async (request: Request, response: Response) => {
    try {
      const policies = await PolicyController.getPolicies(request.service._id)
      const message = `Successfully queried ${policies.length} Policies`
      console.log(message)
      return response.status(200).json({ success: true, result: policies, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private update = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(UpdatePolicyInput, { ...request.body, ...request.params })
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const p = await PolicyController.updatePolicy(data, request.service._id)
      const message = `Updated Policy with _id "${data._id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: p, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private delete = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(MongoIdInput, request.params)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const p = await PolicyController.deletePolicy(data._id!, request.service._id)
      const message = `Deleted Policy with _id "${data._id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: p, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
