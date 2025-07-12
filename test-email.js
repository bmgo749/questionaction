// Direct test using nodemailer
import nodemailer from 'nodemailer';

async function testEmail() {
  console.log('Testing Gmail SMTP connection...');
  
  // Create Gmail SMTP transporter with 16-digit app password
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'bmgobmgo749@gmail.com',
      pass: 'uxujqtkuhldurifo'
    }
  });

  try {
    const mailOptions = {
      from: 'bmgobmgo749@gmail.com',
      to: 'bmgobmgo749@gmail.com',
      subject: 'Queit Database Invitation Test',
      text: 'This is a test email from Queit database system.',
      html: `
        <h2>Queit Database Invitation</h2>
        <p>You have been invited to collaborate on a database project.</p>
        <p>Role: Reader</p>
        <p>Please log in to your Queit account to access the database.</p>
        <br>
        <p>Best regards,<br>Queit Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Email failed to send:', error);
    return false;
  }
}

testEmail().catch(console.error);