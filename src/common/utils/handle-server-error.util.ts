export const handleServerError = (error: any) => {
  console.log(error)
  const message = error instanceof Error ? error.message : 'Unexpected Server Error'
  return { success: false, message }
}
