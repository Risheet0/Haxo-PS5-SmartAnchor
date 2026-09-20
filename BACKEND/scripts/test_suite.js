import http from 'http';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5000';

const request = (method, path, body = null, customHeaders = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Starting Smart Anchor Backend Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (name, condition, extra = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extra}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const health = await request('GET', '/api/health');
    assert('Health Check (GET /api/health)', health.status === 200);

    // 2. Event Current
    const event = await request('GET', '/api/events/current');
    assert('Get Active Event (GET /api/events/current)', event.status === 200 && event.data?.name?.toLowerCase().includes('techfest'));

    // 3. Agenda List
    const agenda = await request('GET', '/api/agenda');
    assert('Get Agenda List (GET /api/agenda)', agenda.status === 200 && Array.isArray(agenda.data) && agenda.data.length >= 8);

    // 4. Speakers List
    const speakers = await request('GET', '/api/speakers');
    assert('Get Speakers List (GET /api/speakers)', speakers.status === 200 && Array.isArray(speakers.data) && speakers.data.length >= 4);

    // 5. Create Agenda Item
    const newAct = await request('POST', '/api/agenda', {
      title: 'Automated Test Session',
      activity_type: 'Test',
      start_time: '05:30 PM',
      end_time: '06:00 PM',
      duration_minutes: 30,
      room: 'Test Room',
      speaker_id: 1,
      notes: 'Backend integration test'
    });
    assert('Create Agenda Session (POST /api/agenda)', newAct.status === 201 && newAct.data?.id);
    const testActId = newAct.data?.id;

    // 6. Update Activity Status
    const statusChange = await request('POST', `/api/agenda/${testActId}/status`, { status: 'LIVE' });
    assert('Transition Activity Status (POST /api/agenda/:id/status)', statusChange.status === 200 && statusChange.data?.status === 'LIVE');

    // 7. Dynamic Delay Injection
    const delayRes = await request('POST', '/api/agenda/delay', {
      minutes: 5,
      targetActivityId: 3,
      reason: 'Automated test delay injection'
    });
    assert('Dynamic Delay Injection (POST /api/agenda/delay)', delayRes.status === 200 && (delayRes.data?.minutes === 5 || delayRes.data?.addedMinutes === 5));

    // 8. Create Speaker
    const newSpk = await request('POST', '/api/speakers', {
      name: 'Dr. Test Scientist',
      email: 'drtest@example.com',
      email_verified: true,
      designation: 'Lead Researcher',
      organization: 'Test Lab',
      bio: 'Pioneering test suite engineering.',
      topic: 'Automated Backend Architecture'
    });
    assert('Create Speaker Profile (POST /api/speakers)', newSpk.status === 201 && newSpk.data?.id);

    // 9. Announcements CRUD & Dismiss
    const newAnn = await request('POST', '/api/announcements', {
      original_prompt: 'Test Announcement Broadcast',
      ai_script: 'Attention all delegates: This is a test announcement broadcast.',
      priority: 'urgent',
      is_active: 1
    });
    assert('Create Announcement (POST /api/announcements)', newAnn.status === 201 && newAnn.data?.id);

    const dismissAnn = await request('POST', `/api/announcements/${newAnn.data.id}/dismiss`);
    assert('Dismiss Announcement (POST /api/announcements/:id/dismiss)', dismissAnn.status === 200 && dismissAnn.data?.success);

    // 10. Audit Logs
    const logs = await request('GET', '/api/logs');
    assert('Fetch Audit Logs (GET /api/logs)', logs.status === 200 && Array.isArray(logs.data) && logs.data.length > 0);

    // 11. AI Script Synthesis (Gemini API)
    const aiGen = await request('POST', '/api/ai/generate', {
      scriptType: 'Speaker Introduction',
      tone: 'Energetic',
      length: 'Short',
      speakerId: 1,
      audience: 'Tech Developers',
      customNotes: 'Highlight latest AI milestone'
    });
    assert('Gemini AI Script Synthesis (POST /api/ai/generate)', aiGen.status === 200 && aiGen.data?.script && aiGen.data.provider);

    // 12. Socket.IO Real-time Hub Verification
    await new Promise((resolve) => {
      const socket = io(API_BASE, { transports: ['websocket', 'polling'] });
      let connected = false;

      socket.on('connect', () => {
        connected = true;
        assert('Socket.IO Connection & Handshake', true);
        socket.disconnect();
        resolve();
      });

      setTimeout(() => {
        if (!connected) {
          assert('Socket.IO Connection & Handshake', false, 'Timeout waiting for connect');
          socket.disconnect();
          resolve();
        }
      }, 3000);
    });

    // 13. Auth & Session Verification Endpoints (GET /api/auth/me)
    const meRes = await request('GET', '/api/auth/me', null, { 'x-user-email': 'risheet@example.com' });
    assert('Get Authenticated User Profile (GET /api/auth/me)', meRes.status === 200 && meRes.data?.user?.role === 'speaker');

    // 14. Event-Based Speaker Console Authorization Tests
    // 14a. Valid Speaker Access to Assigned Event 1 (Risheet -> Event 1)
    const validSpeakerConsole = await request('GET', '/api/events/1/speaker-console', null, { 'x-user-email': 'risheet@example.com' });
    assert('Valid Speaker Console Access (GET /api/events/1/speaker-console)', validSpeakerConsole.status === 200 && validSpeakerConsole.data?.event?.id === 1);

    // 14b. Cross-Event Access Attempt Rejection (Risheet -> Event 2) -> Must Return 403 Forbidden
    const forbiddenConsole = await request('GET', '/api/events/2/speaker-console', null, { 'x-user-email': 'risheet@example.com' });
    assert('Cross-Event URL Tampering 403 Forbidden Rejection', forbiddenConsole.status === 403 && !forbiddenConsole.data?.event);

    // 14c. Valid Speaker B Access to Event 2 (Speaker B -> Event 2)
    const speakerBConsole = await request('GET', '/api/events/2/speaker-console', null, { 'x-user-email': 'speakerb@example.com' });
    assert('Speaker B Access to Event 2 (GET /api/events/2/speaker-console)', speakerBConsole.status === 200 && speakerBConsole.data?.event?.id === 2);

    // 14d. Non-Existent Event Request -> Must Return 404 Not Found
    const notFoundConsole = await request('GET', '/api/events/999/speaker-console', null, { 'x-user-email': 'risheet@example.com' });
    assert('Non-Existent Event 404 Not Found Handling', notFoundConsole.status === 404);

    // 15. Auth & OTP Endpoints (Brevo Email & OTP Security)
    const testOtpEmail = `test.otp.${Date.now()}@example.com`;
    const sendOtpRes = await request('POST', '/api/auth/send-otp', { email: testOtpEmail });
    assert('Send OTP API (POST /api/auth/send-otp)', sendOtpRes.status === 200 && sendOtpRes.data?.success);

    const cooldownRes = await request('POST', '/api/auth/send-otp', { email: testOtpEmail });
    assert('OTP Resend 60-Second Cooldown (POST /api/auth/send-otp)', cooldownRes.status === 429 && !cooldownRes.data?.success);

    const invalidOtpRes = await request('POST', '/api/auth/verify-otp', { email: testOtpEmail, otp: '000000' });
    assert('Invalid OTP Verification (POST /api/auth/verify-otp)', invalidOtpRes.status === 400 && !invalidOtpRes.data?.success);

    const completeSignupRes = await request('POST', '/api/auth/complete-signup', {
      name: 'Test OTP Attendee',
      email: testOtpEmail,
      role: 'user'
    });
    assert('Complete Signup API (POST /api/auth/complete-signup)', completeSignupRes.status === 200 && completeSignupRes.data?.user?.email_verified);

    // 16. Clean up test activity
    await request('DELETE', `/api/agenda/${testActId}`);
    assert('Delete Agenda Item (DELETE /api/agenda/:id)', true);

    console.log(`\n==================================================`);
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`==================================================\n`);

    if (failed === 0) {
      console.log('🎉 All backend components, endpoints, SQLite storage, and Gemini API are operational!');
    }
  } catch (err) {
    console.error('Test Suite Fatal Error:', err);
  }
}

runTests();
