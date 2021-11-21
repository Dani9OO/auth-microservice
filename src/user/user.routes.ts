import { Routing } from '../common/classes/routing.class'
import { Request, Response, Router } from 'express'
import { CreateUserInput, AuthenticateUserInput, ForgotPasswordInput, ResetPasswordInput } from './user.inputs'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { handleValidationError } from '../common/utils/handle-validation-error.util'
import { handleServerError } from '../common/utils/handle-server-error.util'
import { UserController } from './user.controller'
import { authUser } from '../common/middleware/auth-user.middleware'
import { ResponseError } from '../common/errors/response.error'
import { ForbiddenError } from '../common/errors/forbidden.error'
import { renderFile } from 'ejs'
import { join, resolve } from 'path'
import { Mailer } from '../common/mailer'
export class UserRouting extends Routing {
  public readonly resource = 'User'

  public readonly router = Router()

  constructor (private mailer: Mailer) {
    super()
    this.initRoutes()
  }

  private initRoutes () {
    this.router.post('/:_id/auth/register', this.registerUser)
    this.router.post('/:_id/auth', this.authenticateUser)
    this.router.post('/:_id/auth/refresh-token', this.refreshToken)
    this.router.post('/:_id/auth/logout', authUser, this.logout)
    this.router.post('/:_id/auth/verify', this.verifyEmail)
    this.router.post('/:_id/auth/forgot-password', this.forgotPassword)
    this.router.post('/:_id/auth/reset-password', this.resetPassword)
  }

  private registerUser = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(CreateUserInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const { user, service } = await UserController.createUser(data, request.params._id)
      const message = `Successfully registered user with email "${user.email}" to service "${service.name}"`
      response.status(200).json({ success: true, result: user, message: `${message}, you'll soon receive a confirmation email to your inbox.` })
      const url = `${process.env.FRONTEND_URL}/verify/${service.id}?token=${service.token}`
      const html = await renderFile(join(resolve(process.cwd()), 'views', 'verify-mail.ejs'), { forename: user.forename, service: service.name, url })
      await this.mailer.transporter.sendMail({
        from: this.mailer.sender,
        to: user.email,
        subject: `Email verification for ${service.name}`,
        html
      })
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

  private verifyEmail = async (request: Request, response: Response) => {
    try {
      if (!request.query.token) return response.status(400).json(new ResponseError('Verification token is not defined').respond())
      const email = await UserController.verifyEmail(request.params._id, request.query.token.toString())
      const message = `Successfully verified ${email}'s email for service with _id "${request.params._id}"`
      console.log(message)
      return response.status(200).json({ success: true, result: email, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }

  private forgotPassword = async (request: Request, response: Response) => {
    try {
      const data = plainToClass(ForgotPasswordInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const u = await UserController.forgotPassword(data)
      response.status(200).json({ success: true, message: 'Password reset link requested' })
      if (u) {
        const url = `${process.env.FRONTEND_URL}/reset/${request.params._id}?token=${u.token}`
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
      const data = plainToClass(ResetPasswordInput, request.body)
      const errors = await validate(data, { validationError: { target: false }, forbidUnknownValues: true })
      if (errors.length > 0) return response.status(400).json(handleValidationError(errors))
      const email = await UserController.resetPassword(data)
      const message = `Successfully reset password for ${email}`
      console.log(message)
      return response.status(200).json({ success: true, result: email, message })
    } catch (error) { return response.status(500).json(handleServerError(error)) }
  }
}
