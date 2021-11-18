import { IsMongoId } from 'class-validator'

export default class MongoIdInput {
  @IsMongoId()
  public _id?: string
}
