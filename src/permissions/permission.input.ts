import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import MongoIdInput from '../common/validators/mongoid'

export class GetPermissionsInput {
  @IsOptional()
  @IsMongoId()
  public module?: string
}

export class CreatePermissionInput {
  @IsString()
  @IsNotEmpty()
  public name!: string

  @IsMongoId()
  public module!: string
}

export class UpdatePermissionInput extends MongoIdInput.Required {
  @IsString()
  @IsNotEmpty()
  public name!: string
}
