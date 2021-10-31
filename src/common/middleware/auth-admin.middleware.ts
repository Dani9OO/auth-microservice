import { NextFunction, Request, Response } from 'express'
import { UnauthenticatedError } from '../errors/unauthenticated.error'
import { ForbiddenError } from '../errors/forbidden.error'

export default async (request: Request, response: Response, next: NextFunction) => {
  const authHeader = request.header('X-API-KEY')
  if (!authHeader) return response.status(401).json(new UnauthenticatedError(request.ip, request.hostname, request.originalUrl).respond())
  if (authHeader !== process.env.ADMIN_KEY) return response.status(403).json(new ForbiddenError(request.ip, request.originalUrl).respond())
  next()
}
