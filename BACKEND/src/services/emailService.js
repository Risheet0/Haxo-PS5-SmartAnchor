const httpFetch = globalThis.fetch;

/**
 * Brevo Email Service Integration for SASM Platform
 */
export async function sendOtpEmail(email, otp) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || 'ddoinfo098@gmail.com';
  const senderName = process.env.SENDER_NAME || 'SASM';

  const htmlTemplate = `
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
        <div class="subtitle">Your verification code for SASM Event Platform signup is:</div>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <div class="expiry">This code expires in 5 minutes.</div>
        <div class="notice">If you did not request this verification, you can safely ignore this email.</div>
        <div class="footer">&copy; SASM Universal Event Platform</div>
      </div>
    </body>
    </html>
  `;

  if (!brevoApiKey || brevoApiKey === 'your_brevo_api_key' || brevoApiKey === 'your_brevo_api_key_here') {
    console.warn(`\n[Brevo Email Service] ⚠️ BREVO_API_KEY is not set or using placeholder.`);
    console.warn(`[Brevo Email Service] 🔑 Dev OTP generated for ${email}: ${otp}`);
    console.warn(`[Brevo Email Service] To enable real email delivery, set BREVO_API_KEY in BACKEND/.env\n`);
    return {
      success: true,
      delivered: false,
      mode: 'dev_simulated',
      message: 'OTP generated (Dev Simulated Delivery)'
    };
  }

  try {
    const response = await httpFetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail
        },
        to: [
          { email: email }
        ],
        subject: 'Verify your email - SASM',
        htmlContent: htmlTemplate
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[Brevo Email Service] ✅ OTP Email successfully sent to ${email} (MessageId: ${data.messageId})`);
      return { success: true, delivered: true, messageId: data.messageId };
    } else {
      console.error(`[Brevo Email Service] ❌ Brevo API Error (${response.status}):`, data);
      throw new Error(data.message || 'Brevo email dispatch failed');
    }
  } catch (err) {
    console.error(`[Brevo Email Service] ❌ Failed to dispatch email to ${email}:`, err.message);
    throw new Error('Unable to send verification email. Please check server configuration.');
  }
}
