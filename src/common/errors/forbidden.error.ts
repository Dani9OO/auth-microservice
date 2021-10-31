import { ResponseError } from './response.error'
export class ForbiddenError extends ResponseError {
  constructor (
    public ip: string,
    public url: string
  ) {
    super(
      `${ip} was denied access to resource ${url}`,
      'You don\'t have enough permissions to access this resource'
    )
    console.error(this)
  }
}
