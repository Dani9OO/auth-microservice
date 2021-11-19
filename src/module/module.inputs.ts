import { ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateModuleInput {
  @IsString()
  @IsNotEmpty()
  public name!: string

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  public permissions!: string[]
}

export class UpdateModuleInput {
  @IsMongoId()
  public _id?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public name!: string
}
