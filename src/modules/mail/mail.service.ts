import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const mailPort = this.configService.get<number>('MAIL_PORT');
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: mailPort,
      secure: mailPort === 465, // true cho cổng 465, false cho cổng 587
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendOTP(email: string, otp: string) {
    const mailOptions = {
      from: `"EZMOVIE Support" <${this.configService.get<string>('MAIL_USER')}>`,
      to: email,
      subject: 'Xác thực tài khoản EZMOVIE',
      html: `
        <div style="background-color: #f9f9f9; padding: 50px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #121212; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.15); border: 1px solid #222;">
            <div style="background-color: #121212; padding: 45px 30px; text-align: center; border-bottom: 1px solid #222;">
              <h1 style="margin: 0; font-size: 36px; letter-spacing: 6px; font-weight: 900; text-transform: uppercase;">
                <span style="color: #ffffff;">EZ</span><span style="color: #ff5722;">MOVIE</span>
              </h1>
            </div>
            <div style="padding: 40px 30px; background-color: #121212;">
              <h2 style="color: #ff5722; margin-top: 0; font-size: 24px; text-align: center;">Xác Thực Tài Khoản</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #bbbbbb; text-align: center;">Chào bạn, mã OTP của bạn để hoàn tất đăng ký là:</p>
              
              <div style="text-align: center; margin: 35px 0;">
                <div style="display: inline-block; background-color: #1a1a1a; border: 2px dashed #ff5722; padding: 20px 40px; border-radius: 12px;">
                  <span style="font-size: 52px; font-weight: 800; color: #ff5722; letter-spacing: 12px; font-family: 'Courier New', Courier, monospace; -webkit-user-select: all; user-select: all;">${otp}</span>
                </div>
              </div>
              
              <div style="background-color: rgba(255, 87, 34, 0.1); border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #ff5722; text-align: center; margin: 0;">
                  Mã này có hiệu lực trong <strong>1 phút</strong>.
                </p>
              </div>
              
              <p style="font-size: 14px; color: #ff5722; text-align: center; margin-top: 30px; font-weight: 600;">
                Cảnh báo: Tuyệt đối không cung cấp mã OTP này cho bất kỳ ai để tránh mất tài khoản.
              </p>
              <p style="font-size: 15px; color: #bbbbbb; text-align: center; margin-top: 15px;">
                Cảm ơn bạn đã lựa chọn EZMOVIE!
              </p>
            </div>
            <div style="background-color: #080808; padding: 25px; text-align: center; border-top: 1px solid #1a1a1a;">
              <p style="font-size: 11px; color: #444; margin: 0; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 EZMOVIE Studio. Premium Streaming Experience.</p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`[MAIL] OTP sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`[MAIL] Failed to send OTP to ${email}:`, error);
      return false;
    }
  }
}
