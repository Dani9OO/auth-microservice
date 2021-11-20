import { Router } from 'express'

export class Routing {
  public readonly resource!: string

  public readonly router!: Router

  public get path () {
    return `/${this.resource.toLowerCase()}`
  }
}
