import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator'
import MongoIdInput from '../common/validators/mongo-id.input'
export class CreatePolicyInput {
  @IsString()
  @IsNotEmpty()
  public name!: string

  @IsMongoId({ each: true })
  public permissions!: string[]
}

export class UpdatePolicyInput extends MongoIdInput {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public name?: string

  @IsOptional()
  @IsMongoId({ each: true })
  public permissions?: string[]
}
