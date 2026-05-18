import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class VerifyOtpDto {
  @Field()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'OTP cannot be empty' })
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otpCode: string;
}
