import { IsOptional, IsMongoId, IsBoolean } from 'class-validator'
import MongoIdInput from '../common/validators/mongoid'

export class UpdateServiceUserInput extends MongoIdInput.Required {
  @IsOptional()
  @IsMongoId({ each: true })
  public roles?: string[]

  @IsOptional()
  @IsBoolean()
  public disabled!: boolean
}
