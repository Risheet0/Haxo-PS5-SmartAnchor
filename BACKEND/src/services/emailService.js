import nodemailer from 'nodemailer';

/**
 * Real SMTP Email Service for SASM Platform
 * Connected to Gmail SMTP (smtp.gmail.com:465) with Brevo REST fallback
 */

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === 'false' ? false : true;
  const user = process.env.SMTP_USER || process.env.SENDER_EMAIL || 'ddoinfo098@gmail.com';
  const pass = process.env.SMTP_PASS;

  if (pass && pass !== 'YOUR_SMTP_APP_PASSWORD') {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    });
  }
  return null;
}

/**
 * Reusable Mail Dispatch Function
 */
export async function sendMail({ to, subject, html, text }) {
  const senderEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER || 'ddoinfo098@gmail.com';
  const senderName = process.env.SENDER_NAME || 'SASM';
  const from = `"${senderName}" <${senderEmail}>`;

  // 1. Try Nodemailer Real SMTP (smtp.gmail.com:465)
  const transporter = getTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text
      });
      console.log(`[SMTP Mail Service] ✅ Real email delivered to ${to} via SMTP (MessageId: ${info.messageId})`);
      return { success: true, method: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error(`[SMTP Mail Service] ❌ SMTP delivery failed:`, err.message);
    }
  }

  // 2. Try Brevo REST API Fallback
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey && brevoApiKey !== 'your_brevo_api_key_here') {
    try {
      const res = await globalThis.fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': brevoApiKey
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`[Brevo Mail Service] ✅ Email delivered to ${to} via Brevo API (MessageId: ${data.messageId})`);
        return { success: true, method: 'brevo', messageId: data.messageId };
      }
    } catch (err) {
      console.error(`[Brevo Mail Service] ❌ Brevo API delivery failed:`, err.message);
    }
  }

  console.warn(`\n[Mail Service] ⚠️ SMTP_PASS is not configured in BACKEND/.env.`);
  console.warn(`[Mail Service] 📧 Set SMTP_PASS=your_gmail_app_password in BACKEND/.env to enable instant inbox delivery to ${to}.\n`);
  return { success: true, method: 'unconfigured' };
}

/**
 * Send Signup Verification OTP Email
 */
export async function sendVerificationOtp(email, otp) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify your email - SASM</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px; }
        .container { max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 36px 28px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .logo { font-family: monospace; font-weight: 900; font-size: 26px; letter-spacing: -1px; color: #090d16; text-align: center; margin-bottom: 24px; }
        .title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; color: #0f172a; margin-bottom: 8px; text-align: center; }
        .subtitle { font-size: 13px; color: #64748b; margin-bottom: 28px; text-align: center; line-height: 1.5; }
        .otp-box { background: #090d16; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 20px; }
        .otp-code { font-family: monospace; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #ffffff; }
        .expiry { font-size: 12px; font-family: monospace; font-weight: 700; color: #64748b; text-align: center; margin-bottom: 24px; text-transform: uppercase; }
        .notice { font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; }
        .footer { font-family: monospace; font-size: 11px; color: #cbd5e1; text-align: center; margin-top: 24px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">SASM</div>
        <div class="title">Verify your email</div>
        <div class="subtitle">Your verification code is:</div>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <div class="expiry">This code expires in 5 minutes.</div>
        <div class="notice">If you did not request this verification, you can safely ignore this email.</div>
        <div class="footer">&copy; SASM</div>
      </div>
    </body>
    </html>
  `;

  return sendMail({
    to: email,
    subject: 'Verify your email - SASM',
    html: htmlContent,
    text: `SASM\n\nVerify your email\n\nYour verification code is:\n\n${otp}\n\nThis code expires in 5 minutes.\n\nIf you did not request this verification, you can safely ignore this email.\n\n© SASM`
  });
}

/**
 * Send Login Verification OTP Email
 */
export async function sendLoginOtp(email, otp) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Login verification - SASM</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px; }
        .container { max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 36px 28px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .logo { font-family: monospace; font-weight: 900; font-size: 26px; letter-spacing: -1px; color: #090d16; text-align: center; margin-bottom: 24px; }
        .title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; color: #0f172a; margin-bottom: 8px; text-align: center; }
        .subtitle { font-size: 13px; color: #64748b; margin-bottom: 28px; text-align: center; line-height: 1.5; }
        .otp-box { background: #090d16; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 20px; }
        .otp-code { font-family: monospace; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #ffffff; }
        .expiry { font-size: 12px; font-family: monospace; font-weight: 700; color: #64748b; text-align: center; margin-bottom: 24px; text-transform: uppercase; }
        .notice { font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; }
        .footer { font-family: monospace; font-size: 11px; color: #cbd5e1; text-align: center; margin-top: 24px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">SASM</div>
        <div class="title">Login verification</div>
        <div class="subtitle">Your login verification code is:</div>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <div class="expiry">This code expires in 5 minutes.</div>
        <div class="notice">If you did not attempt to log in, please secure your account.</div>
        <div class="footer">&copy; SASM</div>
      </div>
    </body>
    </html>
  `;

  return sendMail({
    to: email,
    subject: 'Login verification - SASM',
    html: htmlContent,
    text: `SASM\n\nLogin verification\n\nYour login verification code is:\n\n${otp}\n\nThis code expires in 5 minutes.\n\nIf you did not attempt to log in, please secure your account.\n\n© SASM`
  });
}
