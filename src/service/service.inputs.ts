import { IsNotEmpty, IsString } from 'class-validator'

export class CreateServiceInput {
  @IsString()
  @IsNotEmpty()
  public name!: string
}
