declare namespace Express {
  export interface Request {
    service: {
      id: string,
      name: string
    }
    user: {
      id: string,
      ownsToken: (user: string, token: string) => Promise<boolean>
    }
  }
}
