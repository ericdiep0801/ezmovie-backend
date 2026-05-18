import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SignupDto {
  @Field()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character',
    },
  )
  password: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Username cannot be empty' })
  username: string;
}
