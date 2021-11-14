import { ModuleRouting } from '../common/classes/module-routing.class'
import { Request, Response, Router } from 'express'
import { CreateUserInput } from './user.inputs'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { UserController } from './user.controller'
import { auth } from '../common/middleware/auth-service.middleware'
export class UserRouting implements ModuleRouting {
  public readonly path = '/user'

  public readonly router = Router()

  constructor () {
    this.initRoutes()
  }

  private initRoutes () {
    this.router.post('/auth/register', auth, this.registerUser)
  }

  private registerUser = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(CreateUserInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const { user } = await UserController.createUser(data, request.service._id)
      const message = `Successfully registered user with _id "${user._id}"`
      return response.status(200).json({ success: true, result: user, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
