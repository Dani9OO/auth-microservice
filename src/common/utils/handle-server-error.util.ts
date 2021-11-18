import { ResponseError } from '../errors/response.error'

export const handleServerError = (error: any) => {
  if (!(error instanceof ResponseError)) console.error(error)
  const message = error instanceof Error ? error.message : 'Unexpected Server Error'
  return { success: false, message }
}
