import { IsNotEmpty, IsString } from 'class-validator'

export class ServiceDTO {
  @IsString()
  @IsNotEmpty()
  public name!: string
}
