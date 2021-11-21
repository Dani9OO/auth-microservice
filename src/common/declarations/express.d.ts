declare namespace Express {
  export interface Request {
    service: {
      _id: string,
      name: string
    }
    user: {
      _id: string,
      ownsToken: (user: string, token: string) => Promise<boolean>
    }
  }
}
