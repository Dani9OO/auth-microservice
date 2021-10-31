import { ResponseError } from './response.error'
export class UnauthenticatedError extends ResponseError {
  constructor (
    public ip: string,
    public hostname: string,
    public url: string
  ) {
    super(
      `${ip} unsuccessfully tried to access resource ${url} from ${hostname}`,
      'You must authenticate to access this resource'
    )
    console.error(this)
  }
}
