import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testBrevo() {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || 'ddoinfo098@gmail.com';
  const senderName = process.env.SENDER_NAME || 'SASM Platform';

  console.log('Testing Brevo Transactional Email Dispatch...');
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: 'kothiyajay1424@gmail.com' }],
        subject: 'SASM Verification Code: 593021',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
            <h2>SASM Verification Portal</h2>
            <p>Your OTP verification code is: <strong style="font-size: 24px; color: #4F46E5;">593021</strong></p>
            <p>This code expires in 5 minutes.</p>
          </div>
        `
      })
    });

    const data = await res.json();
    console.log('Brevo Response Status:', res.status);
    console.log('Brevo Response Body:', data);
  } catch (err) {
    console.error('Brevo Error:', err.message);
  }
}

testBrevo();
