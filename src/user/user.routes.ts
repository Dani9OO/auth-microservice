import { Routing } from '../common/classes/routing.class'
import { Request, Response, Router } from 'express'
import { CreateUserInput, AuthenticateUserInput } from './user.inputs'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { UserController } from './user.controller';
import { auth } from '../common/middleware/auth-service.middleware'
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
      const { user, permissions } = await UserController.validateLogin(data.email, request.service._id)
      const token = await UserController.signToken({ ...user, permissions }, request.service._id)
      const { refreshToken, expires } = await UserController.generateRefreshToken(user.id, request.ip)
      response.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, expires, sameSite: 'none' })
      const message = `Successfully authenticated user with _id "${user.id}" to service ${request.service._id}`
      console.log(message)
      return response.header('Authorization', `Bearer ${token}`).status(200).json({ success: true, result: user, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
