import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailPayload): Promise<void> => {
  try {
    let transporter;

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
      // Use user's SMTP credentials
      transporter = nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
    } else {
      // Generate Ethereal SMTP test credentials dynamically in development
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"MoneyMap Support" <noreply@moneymap.com>',
      to,
      subject,
      html,
    });

    console.log(`Email successfully dispatched to ${to}. Message ID: ${info.messageId}`);
    
    // Ethereal test inbox url link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📩 Click here to preview sent welcome email: ${previewUrl}`);
    }
  } catch (error) {
    console.error('SMTP email dispatch failure:', error);
  }
};
