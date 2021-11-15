import { IsInt, IsOptional } from 'class-validator'

export default class PaginationInput {
  @IsInt()
  @IsOptional()
  public page?: number

  @IsInt()
  @IsOptional()
  public pageSize?: number
}
