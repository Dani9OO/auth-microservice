// eslint-disable-next-line no-undef
export const isError = (error: unknown): error is NodeJS.ErrnoException => {
  if ('code' in (error as any)) return true
  return false
}
