import { IsInt, IsOptional } from 'class-validator'

export default class PaginationInput {
  @IsInt()
  @IsOptional()
  page?: number

  @IsInt()
  @IsOptional()
  pageSize?: number
}
