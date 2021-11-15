export class ResponseError extends Error {
  constructor (
    public message: string,
    public response?: string
  ) {
    super(message)
    this.message = message
    this.name = this.constructor.name
  }

  public respond () {
    return {
      success: false,
      message: this.response || this.message
    }
  }
}
