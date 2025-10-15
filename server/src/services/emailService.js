// server/src/services/emailService.js
const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true', // false for Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendOTP(email, otp) {
    try {
      const mailOptions = {
        from: `"Ethio-freelance" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email - Ethio-freelance',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #2563eb; margin: 0;">Ethio-freelance</h2>
            </div>
            <h3 style="color: #333; margin-bottom: 20px;">Email Verification Code</h3>
            <p style="color: #666;">Please use the following code to complete your registration:</p>
            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">${otp}</div>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  async sendPasswordReset(email, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: `"Ethio-freelance" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your Password - Ethio-freelance',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h3>Password Reset Request</h3>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a>
            <p style="margin-top:20px;">Or copy this link:</p>
            <p>${resetUrl}</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email server is ready to send messages');
      return true;
    } catch (error) {
      console.error('❌ Email server connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
