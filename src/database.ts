import { connect, Mongoose } from 'mongoose'
export class Database {
  private mongoose!: Mongoose

  public async init (uri: string) {
    this.mongoose = await connect(uri)
    console.log('Successfully connected to database')
  }
}
