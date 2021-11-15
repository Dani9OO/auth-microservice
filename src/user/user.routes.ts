import { Routing } from '../common/classes/routing.class'
import { Request, Response, Router } from 'express'
import { CreateUserInput, AuthenticateUserInput } from './user.inputs'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { UserController } from './user.controller'
import { auth } from '../common/middleware/auth-service.middleware'
import { ServiceController } from '../service/service.controller'
import { NotFoundError } from '../common/errors/not-found.error'
import { UnauthorizedError } from '../common/errors/unauthorized.error'
export class UserRouting extends Routing {
  public readonly resource = 'User'

  public readonly router = Router()

  constructor () {
    super()
    this.initRoutes()
  }

  private initRoutes () {
    this.router.post('/auth/register', auth, this.registerUser)
    this.router.post('/auth', auth, this.authenticateUser)
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

  private authenticateUser = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(AuthenticateUserInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const user = await UserController.findUserByEmail(data.email)
      if (!user) return response.status(404).json(new NotFoundError(this.resource, { name: 'email', value: data.email }).respond())
      const service = await ServiceController.findUserInService(user._id.valueOf(), request.service._id)
      if (!service) return response.status(403).json(new UnauthorizedError(user._id.valueOf(), request.service._id).respond())
      // TODO: Sign JWT with permissions payload
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
