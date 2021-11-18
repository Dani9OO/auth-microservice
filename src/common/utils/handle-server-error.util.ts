export const handleServerError = (error: any) => {
  console.error(error)
  const message = error instanceof Error ? error.message : 'Unexpected Server Error'
  return { success: false, message }
}
