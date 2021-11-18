import { IsMongoId, IsNotEmpty, IsString } from 'class-validator'
import MongoIdInput from '../common/validators/mongo-id.input'

export class CreatePermissionInput {
  @IsString()
  @IsNotEmpty()
  public name!: string

  @IsMongoId()
  public module!: string
}

export class UpdatePermissionInput extends MongoIdInput {
  @IsString()
  @IsNotEmpty()
  public name!: string

  @IsMongoId()
  public module?: string
}
