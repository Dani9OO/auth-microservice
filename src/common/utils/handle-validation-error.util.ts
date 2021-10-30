import { ValidationError } from 'class-validator'

export const handleValidationError = (errors: ValidationError[]) => {
  const error = errors.toString()
  console.error(error)
  return { success: false, error, code: 400 }
}
