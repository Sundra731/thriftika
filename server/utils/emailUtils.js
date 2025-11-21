// Email utility functions using nodemailer
import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send verification email to user
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 */
export const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Thriftika" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Thriftika Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4A7C59;">Welcome to Thriftika!</h2>
          <p>Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/verify/${token}"
               style="background-color: #4A7C59; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${process.env.FRONTEND_URL}/verify/${token}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The Thriftika Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Thriftika" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Thriftika Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4A7C59;">Password Reset Request</h2>
          <p>You requested a password reset for your Thriftika account.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #4A7C59; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The Thriftika Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send seller verification status email
 * @param {string} email - Recipient email
 * @param {string} status - Verification status (approved/rejected)
 */
export const sendVerificationStatusEmail = async (email, status) => {
  try {
    const transporter = createTransporter();

    const statusMessages = {
      approved: {
        subject: 'Congratulations! Your Seller Account is Verified',
        title: 'Account Verified Successfully!',
        message: 'Your seller verification has been approved. You can now start listing products on Thriftika.',
        color: '#4A7C59'
      },
      rejected: {
        subject: 'Seller Verification Update',
        title: 'Verification Requires Attention',
        message: 'Your seller verification application requires some additional information or corrections.',
        color: '#8B4513'
      }
    };

    const statusInfo = statusMessages[status] || statusMessages.rejected;

    const mailOptions = {
      from: `"Thriftika" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: statusInfo.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${statusInfo.color};">${statusInfo.title}</h2>
          <p>${statusInfo.message}</p>
          ${status === 'approved' ?
            '<div style="text-align: center; margin: 30px 0;"><a href="' + process.env.FRONTEND_URL + '/seller/dashboard" style="background-color: #4A7C59; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Selling</a></div>'
            : '<p>Please log in to your account to check the status and resubmit if needed.</p>'
          }
          <p>Best regards,<br>The Thriftika Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification status email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification status email:', error);
    throw new Error('Failed to send verification status email');
  }
};


