import { Injectable, Logger } from '@nestjs/common';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../../users/domain/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { MailService } from '../../modules/mail/mail.service';

import { ResendOtpDto } from './dto/resend-otp.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // register
  async signup(signupDto: SignupDto) {
    const { email, username } = signupDto;
    this.logger.log(
      `[Signup] Starting signup process for: ${username} (${email})`,
    );

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (!existingUser.isActive) {
        this.logger.log(
          `[Signup] User ${email} exists but is INACTIVE. Regenerating OTP...`,
        );

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.otpCode = newOtp;
        existingUser.otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000);

        await this.userRepository.update(existingUser.id, {
          otpCode: newOtp,
          otpExpiresAt: existingUser.otpExpiresAt,
          otpType: 'SIGNUP',
        });
        this.logger.log(
          `[Signup] Updated OTP in database for ${email}. Now sending email...`,
        );

        const isSent = await this.mailService.sendOTP(email, newOtp);
        this.logger.log(`[Signup] Email send status (isSent): ${isSent}`);

        if (!isSent) {
          this.logger.error(`[Signup] Failed to send OTP email to ${email}`);
          return {
            status: 500,
            message:
              'Failed to send OTP email. Please check your email address or try again later.',
          };
        }

        this.logger.log(`[Signup] Resent OTP to ${email} successfully.`);
        return {
          status: 200,
          message:
            'User exists but not activated. A new OTP has been sent to your email.',
        };
      }

      this.logger.warn(
        `[Signup] Signup failed: User already exists and is ACTIVE (${email})`,
      );

      const message =
        existingUser.provider === 'local'
          ? 'User already exists'
          : `This email is already linked with ${existingUser.provider}. Please login using ${existingUser.provider}.`;

      return {
        status: 400,
        message,
      };
    }

    // Tạo OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000);

    const newUser = this.userRepository.create({
      ...signupDto,
      otpCode: otp,
      otpExpiresAt,
      otpType: 'SIGNUP',
    });

    this.logger.log(`[Signup] Creating new user record for ${username}...`);
    const savedUser = await this.userRepository.save(newUser);
    this.logger.log(`[Signup] User ${username} saved. Sending initial OTP...`);

    const isSent = await this.mailService.sendOTP(email, otp);
    this.logger.log(`[Signup] Email send status (isSent): ${isSent}`);

    if (!isSent) {
      this.logger.error(`[Signup] Failed to send initial OTP to ${email}`);
      return {
        status: 500,
        message:
          'Failed to send OTP email. Please check your email address or try again later.',
      };
    }

    this.logger.log(
      `[Signup] Signup flow completed for ${email}. Waiting for verification.`,
    );
    const { password, otpCode, ...result } = savedUser;

    return {
      status: 200,
      message:
        'Signup successful. Please check your email for OTP verification.',
      data: result,
    };
  }

  // login
  async signin(signinDto: SigninDto) {
    const { email, password } = signinDto;
    this.logger.log(`[Signin] Attempting signin for: ${email}`);

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`[Signin] Failed: User with email ${email} not found`);
      return {
        status: 404,
        message: 'User not found',
      };
    }

    if (!user.isActive) {
      this.logger.warn(`[Signin] Failed: Account ${email} is not activated`);
      return {
        status: 403,
        message: 'Account is not activated. Please verify your OTP.',
      };
    }

    if (user.provider !== 'local') {
      this.logger.warn(
        `[Signin] Failed: User ${email} uses social login (${user.provider})`,
      );
      return {
        status: 400,
        message: `This account is linked with ${user.provider}. Please use ${user.provider} to login.`,
      };
    }

    this.logger.log(
      `[Signin] User ${user.username} found. Comparing passwords...`,
    );

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      this.logger.warn(
        `[Signin] Failed: Invalid password for ${user.username}`,
      );
      return {
        status: 401,
        message: 'Invalid password',
      };
    }

    this.logger.log(
      `[Signin] Password valid for ${user.username}. Generating JWT...`,
    );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);
    this.logger.log(`[Signin] Success! Token generated for ${user.username}`);

    return {
      status: 200,
      message: 'Signin successful',
      data: {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          avatar: user.avatar,
          provider: user.provider,
        },
      },
    };
  }

  // verify otp for resend otp
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otpCode } = verifyOtpDto;
    this.logger.log(
      `[VerifyOTP] Start verification for: ${email} with code: ${otpCode}`,
    );

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`[VerifyOTP] Failed: User ${email} not found`);
      return { status: 404, message: 'User not found' };
    }

    if (user.isActive) {
      this.logger.log(
        `[VerifyOTP] Account ${email} is already ACTIVE. Skipping.`,
      );
      return { status: 200, message: 'Account is already activated' };
    }

    this.logger.log(`[VerifyOTP] Checking code and expiration for ${email}...`);
    if (user.otpCode !== otpCode) {
      this.logger.warn(
        `[VerifyOTP] Failed: Invalid code ${otpCode} for ${email}`,
      );
      return { status: 400, message: 'Invalid OTP' };
    }

    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      this.logger.warn(`[VerifyOTP] Failed: OTP expired for ${email}`);
      return { status: 400, message: 'OTP has expired' };
    }

    if (user.otpType !== 'SIGNUP') {
      this.logger.warn(
        `[VerifyOTP] Failed: OTP type mismatch for ${email}. Expected SIGNUP but got ${user.otpType}`,
      );
      return { status: 400, message: 'Invalid OTP type' };
    }

    this.logger.log(
      `[VerifyOTP] Code valid! Activating account for ${email}...`,
    );
    user.isActive = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await this.userRepository.update(user.id, {
      isActive: true,
      otpCode: null,
      otpExpiresAt: null,
      otpType: null,
    });

    // Notify all Admins dynamically
    const admins = await this.userRepository.find({ where: { role: UserRole.ADMIN } });
    const adminEmails = admins.map(a => a.email);
    if (adminEmails.length > 0) {
      this.mailService.sendNewUserNotification(user.username, user.email, adminEmails);
    }

    this.logger.log(`[VerifyOTP] Success! Account ${email} is now ACTIVE.`);
    return { status: 200, message: 'Account activated successfully' };
  }

  // resend otp for signup
  async resendOtp(resendOtpDto: ResendOtpDto) {
    const { email } = resendOtpDto;
    this.logger.log(`[ResendOTP] Request received for: ${email}`);

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`[ResendOTP] Failed: User ${email} not found`);
      return { status: 404, message: 'User not found' };
    }

    if (user.isActive) {
      this.logger.log(
        `[ResendOTP] Account ${email} is already active. No need to resend.`,
      );
      return { status: 400, message: 'Account is already activated' };
    }

    this.logger.log(`[ResendOTP] Regenerating OTP for ${email}...`);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = newOtp;
    user.otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

    await this.userRepository.update(user.id, {
      otpCode: newOtp,
      otpExpiresAt: user.otpExpiresAt,
      otpType: 'SIGNUP',
    });
    this.logger.log(
      `[ResendOTP] New OTP saved in DB for ${email}. Now sending email...`,
    );

    const isSent = await this.mailService.sendOTP(email, newOtp);
    this.logger.log(`[ResendOTP] Email send status (isSent): ${isSent}`);

    if (!isSent) {
      this.logger.error(`[ResendOTP] Failed to send email to ${email}`);
      return {
        status: 500,
        message: 'Failed to send OTP email. Please try again later.',
      };
    }

    this.logger.log(`[ResendOTP] Success! New OTP sent to ${email}`);
    return {
      status: 200,
      message: 'A new OTP has been sent to your email.',
    };
  }

  // forgot password
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    this.logger.log(`[ForgotPassword] Request received for: ${email}`);

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`[ForgotPassword] Failed: User ${email} not found`);
      return { status: 404, message: 'User not found' };
    }

    this.logger.log(`[ForgotPassword] Generating reset OTP for ${email}...`);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

    await this.userRepository.update(user.id, {
      otpCode: otp,
      otpExpiresAt,
      otpType: 'FORGOT_PASSWORD',
    });

    const isSent = await this.mailService.sendOTP(email, otp);
    if (!isSent) {
      this.logger.error(`[ForgotPassword] Failed to send email to ${email}`);
      return {
        status: 500,
        message: 'Failed to send OTP email. Please try again later.',
      };
    }

    this.logger.log(`[ForgotPassword] Success! Reset OTP sent to ${email}`);
    return {
      status: 200,
      message: 'Password reset OTP has been sent to your email.',
    };
  }

  // reset password
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, otpCode, newPassword } = resetPasswordDto;
    this.logger.log(`[ResetPassword] Reset attempt for: ${email}`);

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`[ResetPassword] Failed: User ${email} not found`);
      return { status: 404, message: 'User not found' };
    }

    if (user.otpCode !== otpCode) {
      this.logger.warn(`[ResetPassword] Failed: Invalid OTP for ${email}`);
      return { status: 400, message: 'Invalid OTP' };
    }

    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      this.logger.warn(`[ResetPassword] Failed: OTP expired for ${email}`);
      return { status: 400, message: 'OTP has expired' };
    }

    if (user.otpType !== 'FORGOT_PASSWORD') {
      this.logger.warn(
        `[ResetPassword] Failed: OTP type mismatch for ${email}. Expected FORGOT_PASSWORD but got ${user.otpType}`,
      );
      return { status: 400, message: 'Invalid OTP type' };
    }

    this.logger.log(
      `[ResetPassword] OTP verified. Updating password for ${email}...`,
    );

    // We use save() here because we are updating the password and want the @BeforeUpdate hook to trigger
    user.password = newPassword;
    user.otpCode = null;
    user.otpExpiresAt = null;
    user.otpType = null;
    await this.userRepository.save(user);

    this.logger.log(`[ResetPassword] Success! Password updated for ${email}`);
    return {
      status: 200,
      message: 'Password has been reset successfully.',
    };
  }

  // change password
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;
    this.logger.log(`[ChangePassword] Request for user ID: ${userId}`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.error(`[ChangePassword] Failed: User ID ${userId} not found`);
      return { status: 404, message: 'User not found' };
    }

    if (user.provider !== 'local') {
      this.logger.warn(
        `[ChangePassword] Failed: User ${user.username} is using social login`,
      );
      return {
        status: 400,
        message: 'Password management is handled by your social login provider',
      };
    }

    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
      this.logger.warn(
        `[ChangePassword] Failed: Old password incorrect for ${user.username}`,
      );
      return { status: 401, message: 'Old password is incorrect' };
    }

    this.logger.log(
      `[ChangePassword] Updating password for ${user.username}...`,
    );
    user.password = newPassword;
    await this.userRepository.save(user);

    this.logger.log(
      `[ChangePassword] Success! Password changed for ${user.username}`,
    );
    return {
      status: 200,
      message: 'Password changed successfully',
    };
  }

  // update profile
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const { username, avatar } = updateProfileDto;
    this.logger.log(`[UpdateProfile] Request for user ID: ${userId}`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.error(`[UpdateProfile] Failed: User ID ${userId} not found`);
      return { status: 404, message: 'User not found' };
    }

    // Nếu đổi username, check xem có bị trùng không
    if (username && username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username },
      });
      if (existingUser) {
        this.logger.warn(
          `[UpdateProfile] Failed: Username ${username} is already taken`,
        );
        return { status: 400, message: 'Username is already taken' };
      }
    }

    this.logger.log(`[UpdateProfile] Updating profile for ${user.username}...`);
    await this.userRepository.update(userId, {
      ...(username && { username }),
      ...(avatar && { avatar }),
    });

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!updatedUser) {
      return { status: 404, message: 'User not found' };
    }
    const { password, otpCode, otpExpiresAt, otpType, ...result } = updatedUser;

    this.logger.log(
      `[UpdateProfile] Success! Profile updated for ${user.username}`,
    );
    return {
      status: 200,
      message: 'Profile updated successfully',
      data: {
        ...result,
        provider: user.provider,
      },
    };
  }

  // google login
  async googleLogin(req) {
    try {
      if (!req.user) {
        this.logger.error('[GoogleLogin] No user object from Google request');
        return {
          status: 400,
          message: 'No user from google',
        };
      }

      const { email, firstName, lastName, picture } = req.user;
      this.logger.log(`[GoogleLogin] Attempting login/signup for: ${email}`);

      let user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        this.logger.log(
          `[GoogleLogin] User ${email} not found. Creating new account...`,
        );
        // Create new user if not exists
        const baseUsername = email.split('@')[0];
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const username = `${baseUsername}${randomSuffix}`;

        user = this.userRepository.create({
          email,
          username,
          password: Math.random().toString(36).slice(-10), // Random password for social login
          isActive: true, // Google accounts are considered verified
          avatar: picture,
          role: UserRole.USER,
          provider: 'google',
        });
        await this.userRepository.save(user);
        this.logger.log(`[GoogleLogin] New user ${username} created.`);
        
        // Notify all Admins dynamically
        const admins = await this.userRepository.find({ where: { role: UserRole.ADMIN } });
        const adminEmails = admins.map(a => a.email);
        if (adminEmails.length > 0) {
          this.mailService.sendNewUserNotification(username, email, adminEmails);
        }
      } else {
        this.logger.log(
          `[GoogleLogin] User ${user.username} found. Proceeding with login.`,
        );
        // Update avatar if it changed
        if (
          picture &&
          user.avatar !== picture &&
          !user.avatar?.startsWith('/uploads')
        ) {
          await this.userRepository.update(user.id, { avatar: picture });
          user.avatar = picture;
        }

        // Ensure user is active if logging in via Google
        if (!user.isActive) {
          await this.userRepository.update(user.id, { isActive: true });
          user.isActive = true;
        }
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const token = await this.jwtService.signAsync(payload);
      this.logger.log(
        `[GoogleLogin] Success! JWT generated for ${user.username}`,
      );

      return {
        status: 200,
        message: 'Google login successful',
        data: {
          access_token: token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            avatar: user.avatar,
            provider: user.provider,
          },
        },
      };
    } catch (error) {
      this.logger.error(`[GoogleLogin] Error: ${error.message}`, error.stack);
      return {
        status: 500,
        message: 'Internal server error during Google login',
      };
    }
  }

  // get me
  async getMe(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { status: 404, message: 'User not found' };
    }
    const { password, otpCode, otpExpiresAt, otpType, ...result } = user;
    return {
      status: 200,
      data: {
        ...result,
        provider: user.provider,
      },
    };
  }
}
