import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator'
import { User } from './user.model'
import { securePassword, username, diacriticPhrase, diacriticWord } from '../common/constants/regular-expressions'
import MongoIdInput from '../common/validators/mongoid/index'

export class CreateUserInput implements Partial<User> {
  @IsEmail()
  public email!: string

  @IsString()
  @Matches(diacriticWord)
  public forename!: string

  @IsString()
  @Matches(diacriticPhrase)
  public surname!: string

  @IsString()
  @Matches(username)
  public username!: string

  @Matches(securePassword)
  public password!: string
}

export class AuthenticateUserInput {
  @IsEmail()
  public email!: string

  @Matches(securePassword)
  public password!: string
}

export class ForgotPasswordInput extends MongoIdInput.Required {
  @IsEmail()
  public email!: string
}

export class TokenInput extends MongoIdInput.Required {
  @IsString()
  @IsNotEmpty()
  public token!: string
}

export class ResetPasswordInput extends TokenInput {
  @Matches(securePassword)
  public password!: string
}
