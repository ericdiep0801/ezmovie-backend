import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log('[GoogleStrategy] profile:', JSON.stringify(profile, null, 2));
    const { name, emails, photos } = profile;
    
    if (!emails || emails.length === 0) {
      return done(new Error('No email found in Google profile'), undefined);
    }

    const user = {
      email: emails[0].value,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos && photos.length > 0 ? photos[0].value : null,
      accessToken,
    };
    done(null, user);
  }
}
