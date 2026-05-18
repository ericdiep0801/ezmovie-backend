import { Resolver, Mutation, Query, Args, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { SigninDto } from '../../application/dto/signin.dto';
import { SignupDto } from '../../application/dto/signup.dto';
import { VerifyOtpDto } from '../../application/dto/verify-otp.dto';
import { ResendOtpDto } from '../../application/dto/resend-otp.dto';
import { ForgotPasswordDto } from '../../application/dto/forgot-password.dto';
import { ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { ChangePasswordDto } from '../../application/dto/change-password.dto';
import { User } from '../../../users/domain/entities/user.entity';
import { GqlAuthGuard } from '../../infrastructure/guards/gql-auth.guard';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';

@ObjectType()
class AuthPayload {
  @Field()
  access_token: string;

  @Field(() => User)
  user: User;
}

@ObjectType()
class AuthResponse {
  @Field()
  status: number;

  @Field()
  message: string;

  @Field(() => AuthPayload, { nullable: true })
  data?: AuthPayload;
}

@ObjectType()
class UserResponse {
  @Field()
  status: number;

  @Field({ nullable: true })
  message?: string;

  @Field(() => User, { nullable: true })
  data?: User;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async signin(@Args('signinDto') signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Mutation(() => AuthResponse)
  async signup(@Args('signupDto') signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Mutation(() => AuthResponse)
  async verifyOtp(@Args('verifyOtpDto') verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Mutation(() => AuthResponse)
  async resendOtp(@Args('resendOtpDto') resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Mutation(() => AuthResponse)
  async forgotPassword(@Args('forgotPasswordDto') forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Mutation(() => AuthResponse)
  async resetPassword(@Args('resetPasswordDto') resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AuthResponse)
  async changePassword(
    @CurrentUser() user: any,
    @Args('changePasswordDto') changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.sub, changePasswordDto);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserResponse)
  async me(@CurrentUser() user: any) {
    return this.authService.getMe(user.sub);
  }
}
