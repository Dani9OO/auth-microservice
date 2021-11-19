import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator'
import MongoIdInput from '../common/validators/mongo-id.input'
export class CreateRoleInput {
  @IsString()
  @IsNotEmpty()
  public name!: string

  @IsMongoId({ each: true })
  public policies!: string[]
}

export class UpdateRoleInput extends MongoIdInput {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public name?: string

  @IsOptional()
  @IsMongoId({ each: true })
  public policies?: string[]
}
