import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bmgobmgo749@gmail.com',
    pass: 'uxujqtkuhldurifo', // 16-digit app password from vercel.json
  },
});

export async function sendGuildInviteEmail(
  recipientEmail: string,
  guildName: string,
  inviterName: string,
  inviteUrl: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: 'bmgobmgo749@gmail.com',
      to: recipientEmail,
      subject: `You're invited to join ${guildName} on Queit`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Queit Guild Invitation</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-top: 0;">You've been invited to join a guild!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              <strong>${inviterName}</strong> has invited you to join the guild <strong>"${guildName}"</strong> on Queit.
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Guilds are collaborative spaces where members can share content, participate in discussions, and build communities around shared interests.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
              ">Accept Invitation</a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This invitation will expire in 7 days. If you don't have a Queit account, 
              you'll be able to create one when you accept this invitation.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2025 Queit. All rights reserved.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send guild invite email:', error);
    return false;
  }
}

export async function sendGuildRequestNotificationEmail(
  guildOwnerEmail: string,
  guildName: string,
  requesterName: string,
  requestId: number
): Promise<boolean> {
  try {
    const notificationUrl = `https://queit-two.vercel.app/guild/requests/${requestId}`;
    
    const mailOptions = {
      from: 'bmgobmgo749@gmail.com',
      to: guildOwnerEmail,
      subject: `New guild join request for ${guildName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Guild Join Request</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-top: 0;">New member wants to join your guild</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              <strong>${requesterName}</strong> has requested to join your guild <strong>"${guildName}"</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${notificationUrl}" style="
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
              ">Review Request</a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              You can approve or reject this request from your guild management panel.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2025 Queit. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send guild request notification email:', error);
    return false;
  }
}