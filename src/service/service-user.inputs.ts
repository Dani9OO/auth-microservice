import { IsOptional, IsMongoId, IsBoolean } from 'class-validator'
import MongoIdInput from '../common/validators/mongo-id.input'

export class UpdateServiceUserInput extends MongoIdInput {
  @IsOptional()
  @IsMongoId({ each: true })
  public roles?: string[]

  @IsOptional()
  @IsBoolean()
  public disabled!: boolean
}
