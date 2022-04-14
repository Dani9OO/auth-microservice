import { ResponseError } from './response.error'
export class DuplicatedError extends ResponseError {
  constructor (
    public resource: string,
    public identity?: {
      name: string,
      value: string
    }
  ) {
    super(
      `${resource}${identity ? ` identified by ${identity.name} "${identity.value}" already exists` : ''}.`
    )
    console.error(this)
  }
}
