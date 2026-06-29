import nodemailer from 'nodemailer';

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS must be set');
  }
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const transporter = createTransporter();
  const url = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  const from = process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"Dr. Bhattarai Research" <${from}>`,
    to,
    subject: 'Verify your email address',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#8B1A1A;margin-bottom:8px">Welcome, ${name}!</h2>
        <p style="color:#374151;font-size:14px;line-height:1.6">
          Thank you for creating an account. Please verify your email address to access research downloads.
        </p>
        <a href="${url}"
           style="display:inline-block;margin:24px 0;padding:12px 28px;background:#8B1A1A;color:#fff;
                  text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">
          Verify email address
        </a>
        <p style="color:#9ca3af;font-size:12px">
          This link expires in 24 hours. If you did not create an account, ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:11px">Dr. Dhruba Prasad Bhattarai · Research & Publications</p>
      </div>
    `,
  });
}
