import { Router } from 'express'

export class Routing {
  public readonly resource!: string

  public readonly path: string = `/${this.resource.toLowerCase()}`

  public readonly router!: Router
}
