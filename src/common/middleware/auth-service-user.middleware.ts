import { Request, Response, NextFunction } from 'express'
import { ServiceController } from '../../service/service.controller'
import { NotFoundError } from '../errors/not-found.error'
import { UnauthenticatedError } from '../errors/unauthenticated.error'
import { ResponseError } from '../errors/response.error'
import { verify } from 'jsonwebtoken'
import { readFile } from 'fs/promises'
import { join, resolve } from 'path'
import { UserController } from '../../user/user.controller'

interface UserAuthenticationPayload {
  id: string,
  name: string,
  email: string,
  username: string,
  permissions: string[]
}

export const authServiceUser = async (request: Request, response: Response, next: NextFunction) => {
  const service = await ServiceController.findServiceById(request.params.id)
  if (!service) return response.status(404).json(new NotFoundError('Service', { name: 'id', value: request.params.id }).respond())
  const token = request.header('Authorization')
  if (!token) return response.status(401).json(new UnauthenticatedError(request.ip, request.hostname, request.originalUrl).respond())
  if (!token.startsWith('Bearer')) return response.status(400).json(new ResponseError('Invalid session token, try logging in again').respond())
  const data = verify(token, await readFile(join(resolve(process.cwd()), 'keys', service.id, 'public.pem'))) as UserAuthenticationPayload
  const user = await UserController.findUserById(data.id)
  if (!user) return response.status(403).json(new ResponseError('Invalid session token, try logging in again').respond())
  request.user = {
    id: data.id,
    ownsToken: async (user: string, token: string) => {
      const rt = await UserController.findRefreshToken(user, token)
      if (rt) return true; else return false
    }
  }
  next()
}
