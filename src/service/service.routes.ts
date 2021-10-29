import { Request, Response, Router } from 'express'
import { RoutingController } from '../common/classes/routing-controller.class'

export class ServiceRouting implements RoutingController {
  public readonly path = '/service'

  public readonly router = Router()

  constructor () {
    this.initRoutes()
  }

  private initRoutes () {
    this.router.post(`${this.path}/`, this.createService)
  }

  private createService = async (request: Request, response: Response) => {

  }
}
