const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
      secure: false, // Gmail requires 'false' for TLS on port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // prevents some TLS handshake issues
      },
    });
  }

  // ✅ Generate numeric OTP for verification or password reset
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // ✅ Generate secure token (for clickable reset link)
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // ✅ Send registration or verification OTP
  async sendOTP(email, otp) {
    try {
      const mailOptions = {
        from: `"Ethio-freelance" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email - Ethio-freelance',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2563eb;">Ethio-freelance</h2>
            <p>Please use the following code to verify your email:</p>
            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; text-align: center; border-radius: 8px;">
              <span style="font-size: 28px; font-weight: bold; color: #2563eb;">${otp}</span>
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Error sending OTP email:', error.message);
      throw new Error('Failed to send OTP email');
    }
  }

  // ✅ Send password reset OTP or link
  async sendPasswordReset(email, otpOrToken) {
    try {
      // If the reset uses OTP
      const isOtp = /^\d{6}$/.test(otpOrToken);

      let subject, html;
      if (isOtp) {
        subject = 'Your Password Reset OTP - Ethio-freelance';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Use the OTP below to reset your password:</p>
            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; text-align: center; border-radius: 8px;">
              <span style="font-size: 28px; font-weight: bold; color: #2563eb;">${otpOrToken}</span>
            </div>
            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
          </div>
        `;
      } else {
        // If the reset uses a token link
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${otpOrToken}`;
        subject = 'Reset Your Password - Ethio-freelance';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a>
            <p style="margin-top:20px;">Or copy this link: ${resetUrl}</p>
          </div>
        `;
      }

      const mailOptions = {
        from: `"Ethio-freelance" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Error sending password reset email:', error.message);
      throw new Error('Failed to send password reset email');
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email server is ready to send messages');
      return true;
    } catch (error) {
      console.error('❌ Email server connection failed:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
