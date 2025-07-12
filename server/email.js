import nodemailer from 'nodemailer';
import { CONFIG } from './config.js';

// Create Gmail SMTP transporter with 16-digit app password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: CONFIG.EMAIL_USER,
    pass: CONFIG.EMAIL_PASS
  }
});

export async function sendEmail({ to, from, subject, text, html }) {
  try {
    const mailOptions = {
      from: from || CONFIG.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Gmail SMTP email error:', error);
    return false;
  }
}