import { ResponseError } from './response.error'
export class UnauthorizedError extends ResponseError {
  constructor (
    public user: string,
    public service: string
  ) {
    super(
      `User with _id "${user}" has not yet registered to service "${service}"`,
      'You have not yet registered to this service'
    )
    console.error(this)
  }
}
