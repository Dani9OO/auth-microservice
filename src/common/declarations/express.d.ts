declare namespace Express {
  export interface Request {
    service: {
      _id: string,
      name: string
    }
  }
}
