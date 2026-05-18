import { Body, Controller, Post, UseGuards, Request, UseInterceptors, UploadedFile, Get, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as express from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../application/auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { SigninDto } from '../application/dto/signin.dto';
import { SignupDto } from '../application/dto/signup.dto';
import { VerifyOtpDto } from '../application/dto/verify-otp.dto';
import { ResendOtpDto } from '../application/dto/resend-otp.dto';
import { ForgotPasswordDto } from '../application/dto/forgot-password.dto';
import { ResetPasswordDto } from '../application/dto/reset-password.dto';
import { ChangePasswordDto } from '../application/dto/change-password.dto';
import { UpdateProfileDto } from '../application/dto/update-profile.dto';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('signin')
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    return this.authService.getMe(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-profile')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarPath = file ? `/uploads/avatars/${file.filename}` : undefined;
    return this.authService.updateProfile(req.user.userId, {
      ...updateProfileDto,
      ...(avatarPath && { avatar: avatarPath }),
    });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req) {
    // This will initiate the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res: express.Response) {
    const result = await this.authService.googleLogin(req);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (result.status === 200 && result.data) {
      const token = result.data.access_token;
      // Redirect to frontend with token and isPopup flag
      res.redirect(`${frontendUrl}/login?token=${token}&isPopup=true`);
    } else {
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(result.message)}&isPopup=true`);
    }
  }
}
