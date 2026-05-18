import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ResetPasswordDto {
  @Field()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'OTP code cannot be empty' })
  otpCode: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'New password cannot be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character',
    },
  )
  newPassword: string;
}
