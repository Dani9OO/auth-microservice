import cors from 'cors'
import { json } from 'body-parser'
import express, { Application, urlencoded } from 'express'
import { Routing } from './common/classes/routing.class'
import cookieParser from 'cookie-parser'
export class App {
  private app: Application

  constructor (
    private routers: Routing[]
  ) {
    this.app = express()
    this.initMiddleware()
    this.initRouters()
  }

  public listen (port: number, listen: string) {
    this.app.listen(port, listen, () => { console.log(`App listening on port ${port}`) })
  }

  private initMiddleware () {
    this.app.set('trust proxy', 1)
    this.app.use(json())
    this.app.use(urlencoded({ extended: true }))
    this.app.use(cors({ exposedHeaders: ['X-API-KEY'], credentials: true }))
    this.app.use(cookieParser())
  }

  private initRouters () {
    this.routers.forEach((r) => { this.app.use('/api', r.router) })
  }
}
