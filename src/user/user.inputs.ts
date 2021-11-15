import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator'
import { User } from './user.model'
import { securePassword } from '../common/constants/secure-password.regexp'

export class CreateUserInput implements Partial<User> {
  @IsEmail()
  public email!: string

  @IsString()
  @IsNotEmpty()
  public forename!: string

  @IsString()
  @IsNotEmpty()
  public surname!: string

  @IsString()
  @IsNotEmpty()
  public username!: string

  @Matches(securePassword)
  public password!: string
}

export class AuthenticateUserInput {
  @IsEmail()
  public email!: string

  @IsString()
  @IsNotEmpty()
  public password!: string
}
