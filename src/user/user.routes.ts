import { Routing } from '../common/classes/routing.class'
import { Request, Response, Router } from 'express'
import { CreateUserInput, AuthenticateUserInput } from './user.inputs'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { UserController } from './user.controller'
import { authUser } from '../common/middleware/auth-user.middleware'
import { ResponseError } from '../common/errors/response.error'
import { ForbiddenError } from '../common/errors/forbidden.error'
export class UserRouting extends Routing {
  public readonly resource = 'User'

  public readonly router = Router()

  constructor () {
    super()
    this.initRoutes()
  }

  private initRoutes () {
    this.router.post('/:_id/auth/register', this.registerUser)
    this.router.post('/:_id/auth', this.authenticateUser)
    this.router.post('/:_id/auth/refresh-token', this.refreshToken)
    this.router.post('/:_id/auth/logout', authUser, this.logout)
  }

  private registerUser = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(CreateUserInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const { user } = await UserController.createUser(data, request.params._id)
      const message = `Successfully registered user with _id "${user._id}"`
      return response.status(200).json({ success: true, result: user, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private authenticateUser = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(AuthenticateUserInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const { user, permissions } = await UserController.validateLogin(data.email, data.password, request.params._id, request.ip)
      const token = await UserController.signToken({ ...user, permissions }, request.params._id)
      const { refreshToken, expires } = await UserController.generateRefreshToken(user.id, request.ip)
      response.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, expires, sameSite: 'none' })
      const message = `Successfully authenticated user with _id "${user.id}" to service ${request.params._id}`
      console.log(message)
      return response.header('Authorization', `Bearer ${token}`).status(200).json({ success: true, result: user, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private refreshToken = async (request: Request, response: Response) => {
    try {
      const {
        user,
        permissions,
        refreshToken,
        expires
      } = await UserController.refreshToken(request.cookies.refreshToken, request.params._id, request.ip)
      response.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, expires, sameSite: 'none' })
      const token = await UserController.signToken({ ...user, permissions }, request.params._id)
      const message = `Successfully refreshed token for user with _id "${user.id}" to service ${request.params._id}`
      console.log(message)
      return response.header('Authorization', `Bearer ${token}`).status(200).json({ success: true, result: user, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private logout = async (request: Request, response: Response) => {
    try {
      if (!request.cookies.refreshToken) return response.status(400).json(new ResponseError('No token was received').respond())
      if (!request.user.ownsToken(request.user._id, request.cookies.refreshToken)) {
        return response.status(403).json(new ForbiddenError(request.ip, request.originalUrl).respond())
      }
      await UserController.logout(request.cookies.refreshToken, request.ip)
      const message = `Successfully logged out user with _id "${request.user._id}"`
      console.log(message)
      return response.status(200).json({ success: true, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
