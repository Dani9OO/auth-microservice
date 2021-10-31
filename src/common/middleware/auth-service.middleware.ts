import { NextFunction, Request, Response } from 'express'
import { ServiceController } from '../../service/service.controller'
import { UnauthenticatedError } from '../errors/unauthenticated.error'
import { ForbiddenError } from '../errors/forbidden.error'
import { verify } from 'argon2'

export const auth = async (request: Request, response: Response, next: NextFunction) => {
  const authHeader = request.header('X-API-KEY')
  if (!authHeader) return response.status(401).json(new UnauthenticatedError(request.ip, request.hostname, request.originalUrl).respond())
  const [prefix, key] = [authHeader.slice(0, 6), authHeader.slice(7)]
  const service = await ServiceController.findServiceByPrefix(prefix)
  if (!service) return response.status(403).json(new ForbiddenError(request.ip, request.originalUrl).respond())
  if (!(await verify(service.apiKey.key, key))) return response.status(403).json(new ForbiddenError(request.ip, request.originalUrl).respond())
  next()
}
