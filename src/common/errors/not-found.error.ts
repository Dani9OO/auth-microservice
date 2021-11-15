import { ResponseError } from './response.error'
export class NotFoundError extends ResponseError {
  constructor (
    public resource: string,
    public identity?: {
      name: string,
      value: string
    }
  ) {
    super(
      `Couldn't find${resource}${identity ? ` identified by ${identity.name} "${identity.value}"` : ''}.`
    )
    console.error(this)
  }
}
