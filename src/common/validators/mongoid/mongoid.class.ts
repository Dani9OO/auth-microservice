import { IsMongoId, IsOptional } from 'class-validator'

export class Required {
  @IsMongoId()
  public id!: string
}

export class Optional {
  @IsOptional()
  @IsMongoId()
  public id?: string
}
