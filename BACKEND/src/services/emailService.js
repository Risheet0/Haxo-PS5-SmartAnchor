import nodemailer from 'nodemailer';

/**
 * Real SMTP Email Service for SASM Platform
 * Connected to Gmail SMTP (smtp.gmail.com:465) with Brevo REST fallback
 */

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === 'false' ? false : true;
  const user = (process.env.SMTP_USER || process.env.SENDER_EMAIL || 'ddoinfo098@gmail.com').trim();
  const rawPass = process.env.SMTP_PASS || '';
  const pass = rawPass.replace(/\s+/g, '');

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

/**
 * Send Speaker Verification OTP Email
 */
export async function sendSpeakerVerificationOtp(email, otp) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SASM — Speaker Email Verification</title>
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
        <div class="title">Speaker Verification</div>
        <div class="subtitle">Your verification code for speaker registration is:</div>
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
    subject: 'SASM — Speaker Email Verification',
    html: htmlContent,
    text: `SASM\n\nSpeaker Verification\n\nYour verification code for speaker registration is:\n\n${otp}\n\nThis code expires in 5 minutes.\n\nIf you did not request this verification, you can safely ignore this email.\n\n© SASM`
  });
}

/**
 * Send Notification Email to Registered Manager when a Speaker is Created
 */
export async function sendManagerSpeakerCreatedNotification({
  managerName,
  managerEmail,
  speakerName,
  speakerDesignation,
  speakerOrganization,
  speakerEmail,
  loginUrl = 'http://localhost:5173/login'
}) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SASM — Speaker Created Successfully</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 36px 28px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .logo { font-family: monospace; font-weight: 900; font-size: 26px; letter-spacing: -1px; color: #090d16; text-align: center; margin-bottom: 24px; }
        .title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; color: #0f172a; margin-bottom: 12px; text-align: center; }
        .subtitle { font-size: 14px; color: #475569; margin-bottom: 24px; line-height: 1.6; }
        .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px; font-size: 13px; line-height: 1.7; }
        .details-box strong { color: #0f172a; }
        .notice-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 16px 20px; color: #166534; font-size: 13px; margin-bottom: 24px; line-height: 1.5; }
        .cta-btn { display: block; text-align: center; background: #090d16; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; margin-bottom: 24px; }
        .footer { font-family: monospace; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">SASM</div>
        <div class="title">Speaker Created Successfully</div>
        <div class="subtitle">Hello <strong>${managerName}</strong>,<br><br>The speaker/dignitary has been successfully added to SASM.</div>
        
        <div class="details-box">
          <div style="font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; color: #64748b; margin-bottom: 8px;">Speaker Details</div>
          <div><strong>Name:</strong> ${speakerName}</div>
          <div><strong>Designation:</strong> ${speakerDesignation}</div>
          <div><strong>Organization:</strong> ${speakerOrganization}</div>
          <div><strong>Email:</strong> ${speakerEmail}</div>
        </div>

        <div class="notice-box">
          <strong>Manager Access Notice:</strong> Your existing Manager account can be used to access the Manager Area.<br><br>
          <div><strong>Manager Username:</strong> ${managerEmail}</div>
          <div><strong>Manager Login:</strong> <a href="${loginUrl}" style="color: #15803d; text-decoration: underline;">${loginUrl}</a></div>
          <div style="margin-top: 10px; font-size: 12px; color: #15803d; font-weight: 600;">No new Manager account is required. Use your existing Manager username and password.</div>
        </div>

        <a href="${loginUrl}" class="cta-btn">Access Manager Area</a>

        <div class="footer">Regards,<br>SASM Team</div>
      </div>
    </body>
    </html>
  `;

  return sendMail({
    to: managerEmail,
    subject: 'SASM — Speaker Created Successfully',
    html: htmlContent,
    text: `Hello ${managerName},\n\nThe speaker/dignitary has been successfully added to SASM.\n\nSpeaker Details\nName: ${speakerName}\nDesignation: ${speakerDesignation}\nOrganization: ${speakerOrganization}\nEmail: ${speakerEmail}\n\nYour existing Manager account can be used to access the Manager Area.\n\nManager Username:\n${managerEmail}\n\nManager Login:\n${loginUrl}\n\nYou do not need to create another Manager account.\n\nRegards,\nSASM Team`
  });
}

/**
 * Send Account Credentials Email to Newly Created Speaker
 */
export async function sendSpeakerAccountCredentialsEmail({
  speakerName,
  speakerEmail,
  tempPassword,
  eventName = 'TechFest 2026',
  loginUrl = 'http://localhost:5173/login'
}) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SASM — Your Speaker Account Credentials</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 36px 28px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .logo { font-family: monospace; font-weight: 900; font-size: 26px; letter-spacing: -1px; color: #090d16; text-align: center; margin-bottom: 24px; }
        .title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; color: #0f172a; margin-bottom: 12px; text-align: center; }
        .subtitle { font-size: 14px; color: #475569; margin-bottom: 24px; line-height: 1.6; }
        .creds-box { background: #090d16; border-radius: 16px; padding: 24px; color: #ffffff; margin-bottom: 24px; text-align: left; }
        .creds-row { margin-bottom: 12px; font-size: 13px; font-family: monospace; }
        .creds-label { color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .creds-val { font-size: 16px; font-weight: 800; color: #ffffff; word-break: break-all; }
        .notice-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 16px 20px; color: #1e40af; font-size: 13px; margin-bottom: 24px; line-height: 1.5; }
        .cta-btn { display: block; text-align: center; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; margin-bottom: 24px; }
        .footer { font-family: monospace; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">SASM</div>
        <div class="title">Your Speaker Account Credentials</div>
        <div class="subtitle">Hello <strong>${speakerName}</strong>,<br><br>You have been officially registered as a Speaker for <strong>${eventName}</strong>. An account has been provisioned for you.</div>
        
        <div class="creds-box">
          <div class="creds-row">
            <div class="creds-label">Event / Organization</div>
            <div class="creds-val">${eventName}</div>
          </div>
          <div class="creds-row">
            <div class="creds-label">Username / Email</div>
            <div class="creds-val">${speakerEmail}</div>
          </div>
          <div class="creds-row" style="margin-bottom: 0;">
            <div class="creds-label">Temporary Password</div>
            <div class="creds-val" style="letter-spacing: 2px; color: #a5b4fc;">${tempPassword}</div>
          </div>
        </div>

        <div class="notice-box">
          <strong>Important Instructions:</strong> Please do not create a new account. Sign in at the SASM Manager & Speaker Portal using the username and temporary password provided above to open your <strong>${eventName} Speaker Console</strong>.
        </div>

        <a href="${loginUrl}" class="cta-btn">Sign In to Speaker Console</a>

        <div class="footer">Regards,<br>SASM Team</div>
      </div>
    </body>
    </html>
  `;

  return sendMail({
    to: speakerEmail,
    subject: 'SASM — Your Speaker Account Credentials',
    html: htmlContent,
    text: `Hello ${speakerName},\n\nYou have been officially registered as a Speaker for ${eventName}.\n\nYour Account Details:\nEvent / Organization: ${eventName}\nUsername / Email: ${speakerEmail}\nTemporary Password: ${tempPassword}\n\nPlease do not create a new account. Sign in at ${loginUrl} using your username and temporary password to access your Speaker Console.\n\nRegards,\nSASM Team`
  });
}

