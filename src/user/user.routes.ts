import { Routing } from '../common/classes/routing.class'
import { Request, Response, Router } from 'express'
import { CreateUserInput, AuthenticateUserInput, ForgotPasswordInput, ResetPasswordInput, TokenInput } from './user.inputs'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { UserController } from './user.controller'
import { authServiceUser } from '../common/middleware/auth-service-user.middleware'
import { ResponseError } from '../common/errors/response.error'
import { ForbiddenError } from '../common/errors/forbidden.error'
import { renderFile } from 'ejs'
import { join, resolve } from 'path'
import { Mailer } from '../common/mailer'
import { authUser } from '../common/middleware/auth-user.middleware'
import MongoIdInput from '../common/validators/mongoid'
export class UserRouting extends Routing {
  public readonly resource = 'User'

  public readonly router = Router()

  constructor (private mailer: Mailer) {
    super()
    this.initRoutes()
  }

  private initRoutes () {
    this.router.post('/auth', this.authenticateServiceUser)
    this.router.post('/:id/auth/register', this.registerUser)
    this.router.post('/:id/auth', this.authenticateServiceUser)
    this.router.post('/:id/auth/authorize', authUser, this.authorizeService)
    this.router.post('/:id/auth/refresh-token', this.refreshToken)
    this.router.post('/:id/auth/logout', authServiceUser, this.logout)
    this.router.post('/:id/auth/verify', this.verifyEmail)
    this.router.post('/:id/auth/forgot-password', this.forgotPassword)
    this.router.post('/:id/auth/reset-password', this.resetPassword)
  }

  private registerUser = async (request: Request, response: Response) => {
    try {
      const s = plainToClass(MongoIdInput.Required, request.params)
      const paramErrors = await validate(s, { validationError: { target: false }, forbidUnknownValues: true })
      if (paramErrors.length > 0) return response.status(400).json(handleValidationError(paramErrors))
      const data = plainToClass(CreateUserInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const { user, service } = await UserController.createUser(data, s.id)
      const message = `Successfully registered user with email "${user.email}" to service "${service.name}"`
      response.status(200).json({ success: true, result: user, message: `${message}, you'll soon receive a confirmation email to your inbox.` })
      const url = `${process.env.FRONTEND_URL}/auth/${service.id}/verify?token=${service.token}`
      const html = await renderFile(join(resolve(process.cwd()), 'views', 'verify-mail.ejs'), { forename: user.forename, service: service.name, url })
      await this.mailer.transporter.sendMail({
        from: this.mailer.sender,
        to: user.email,
        subject: `Email verification for ${service.name}`,
        html
      })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private authorizeService = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(MongoIdInput.Required, request.params)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      await UserController.authorizeService(request.user.id, data.id)
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private authenticateServiceUser = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(AuthenticateUserInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const { user, permissions } = await UserController.validateLogin(data.email, data.password, request.params.id, request.ip)
      const token = await UserController.signToken({ ...user, permissions }, request.params.id)
      const { refreshToken, expires } = await UserController.generateRefreshToken(user.id, request.ip)
      response.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, expires, sameSite: 'none' })
      const message = `Successfully authenticated user with id "${user.id}" to service ${request.params.id}`
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
      } = await UserController.refreshToken(request.cookies.refreshToken, request.params.id, request.ip)
      response.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, expires, sameSite: 'none' })
      const token = await UserController.signToken({ ...user, permissions }, request.params.id)
      const message = `Successfully refreshed token for user with id "${user.id}" to service ${request.params.id}`
      console.log(message)
      return response.header('Authorization', `Bearer ${token}`).status(200).json({ success: true, result: user, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private logout = async (request: Request, response: Response) => {
    try {
      if (!request.cookies.refreshToken) return response.status(400).json(new ResponseError('No token was received').respond())
      if (!request.user.ownsToken(request.user.id, request.cookies.refreshToken)) {
        return response.status(403).json(new ForbiddenError(request.ip, request.originalUrl).respond())
      }
      await UserController.logout(request.cookies.refreshToken, request.ip)
      const message = `Successfully logged out user with id "${request.user.id}"`
      console.log(message)
      return response.status(200).json({ success: true, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private verifyEmail = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(TokenInput, { ...request.body, ...request.query })
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const email = await UserController.verifyEmail(data.id, data.token)
      const message = `Successfully verified ${email}'s email for service with id "${data.id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: email, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private forgotPassword = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(ForgotPasswordInput, { ...request.body, ...request.query })
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const u = await UserController.forgotPassword(data)
      response.status(200).json({ success: true, message: 'Password reset link requested' })
      if (u) {
        const url = `${process.env.FRONTEND_URL}/auth/${data.id!}/reset?token=${u.token}`
        const html = await renderFile(join(resolve(process.cwd()), 'views', 'reset-password.ejs'), { forename: u.forename, url })
        await this.mailer.transporter.sendMail({
          from: this.mailer.sender,
          to: u.email,
          subject: 'Password reset information',
          html
        })
      }
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private resetPassword = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(ResetPasswordInput, { ...request.body, ...request.params })
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const email = await UserController.resetPassword(data)
      const message = `Successfully reset password for ${email}`
      console.log(message)
      return response.status(200).json({ success: true, result: email, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
