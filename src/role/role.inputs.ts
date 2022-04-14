import { IsString, IsNotEmpty, IsMongoId, IsOptional, IsBoolean } from 'class-validator'
import MongoIdInput from '../common/validators/mongoid'
export class CreateRoleInput {
  @IsString()
  @IsNotEmpty()
  public name!: string

  @IsMongoId({ each: true })
  public policies!: string[]

  @IsOptional()
  @IsBoolean()
  public default!: boolean
}

export class UpdateRoleInput extends MongoIdInput.Required {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public name?: string

  @IsOptional()
  @IsMongoId({ each: true })
  public policies?: string[]

  @IsOptional()
  @IsBoolean()
  public default!: boolean
}
