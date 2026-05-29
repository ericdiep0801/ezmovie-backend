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

  async sendNewUserNotification(username: string, email: string, adminEmails: string[]) {
    if (!adminEmails || adminEmails.length === 0) return false;
    
    const mailOptions = {
      from: `"EZMOVIE System" <${this.configService.get<string>('MAIL_USER')}>`,
      to: adminEmails,
      subject: '🎉 Có thành viên mới gia nhập EZMOVIE',
      html: `
        <div style="background-color: #f0f2f5; padding: 40px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e1e4e8;">
            <div style="background: linear-gradient(135deg, #121212 0%, #2a2a2a 100%); padding: 30px; text-align: center; border-bottom: 4px solid #ff5722;">
              <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 800; text-transform: uppercase;">
                <span style="color: #ffffff;">EZ</span><span style="color: #ff5722;">MOVIE</span> <span style="color: #ffffff; font-size: 16px; font-weight: normal; vertical-align: middle;">ADMIN SYSTEM</span>
              </h1>
            </div>
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="background-color: #e8f5e9; color: #4caf50; display: inline-block; padding: 10px 20px; border-radius: 30px; font-weight: 600; font-size: 14px;">
                  ✨ TÀI KHOẢN MỚI
                </div>
              </div>
              
              <h2 style="color: #2c3e50; margin-top: 0; font-size: 22px; text-align: center; margin-bottom: 25px;">Có một người dùng mới vừa đăng ký!</h2>
              
              <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-size: 14px; width: 40%;">Tên đăng nhập:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; color: #212529; font-size: 16px; font-weight: 600; text-align: right;">${username}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">Email:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef; color: #212529; font-size: 16px; font-weight: 600; text-align: right;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6c757d; font-size: 14px;">Thời gian:</td>
                    <td style="padding: 10px 0; color: #212529; font-size: 15px; font-weight: 500; text-align: right;">${new Date().toLocaleString('vi-VN')}</td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 15px; color: #555; text-align: center; line-height: 1.6; margin-top: 0;">
                Bạn có thể đăng nhập vào trang quản trị để kiểm tra, quản lý phân quyền hoặc xóa người dùng này nếu cần thiết.
              </p>
              
              <div style="text-align: center; margin-top: 35px;">
                <a href="#" style="background-color: #ff5722; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(255, 87, 34, 0.3);">Đến Trang Quản Trị</a>
              </div>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="font-size: 12px; color: #999; margin: 0;">Email này được gửi tự động từ hệ thống EZMOVIE.<br>Vui lòng không trả lời email này.</p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      // Dùng mail bất đồng bộ (không await) để không làm chậm luồng response cho User
      this.transporter.sendMail(mailOptions).then(() => {
        this.logger.log(`[MAIL] Admin notification sent successfully for user ${username}`);
      }).catch((error) => {
        this.logger.error(`[MAIL] Failed to send admin notification:`, error);
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
