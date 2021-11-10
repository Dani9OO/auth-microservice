import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator'
import { User } from './user.model'
import { securePassword } from '../common/constants/secure-password.regexp'

export class CreateUserInput implements Partial<User> {
  @IsEmail()
  email!: string

  @IsString()
  @IsNotEmpty()
  forename!: string

  @IsString()
  @IsNotEmpty()
  surname!: string

  @IsString()
  @IsNotEmpty()
  username!: string

  @Matches(securePassword)
  password!: string
}
