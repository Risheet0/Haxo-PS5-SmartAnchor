import http from 'http';

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

async function testAuth() {
  console.log('🔒 Starting SASM Authentication Security Verification Suite...\n');
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
    // Test 1 — Correct credentials
    const t1 = await request('POST', '/api/auth/login', {
      email: 'risheet@example.com',
      password: 'CorrectPassword123',
      role: 'speaker'
    });
    assert('Test 1 — Correct credentials (200 OK & user data returned)', t1.status === 200 && t1.data?.success === true && t1.data?.user?.email === 'risheet@example.com');

    // Test 2 — Wrong password
    const t2 = await request('POST', '/api/auth/login', {
      email: 'risheet@example.com',
      password: 'WrongPassword123',
      role: 'speaker'
    });
    assert('Test 2 — Wrong password (401 Unauthorized)', t2.status === 401 && t2.data?.success === false && t2.data?.message === 'Invalid email or password.', JSON.stringify(t2));

    // Test 3 — Wrong email
    const t3 = await request('POST', '/api/auth/login', {
      email: 'wrong@example.com',
      password: 'CorrectPassword123',
      role: 'user'
    });
    assert('Test 3 — Wrong email (401 Unauthorized)', t3.status === 401 && t3.data?.success === false && t3.data?.message === 'Invalid email or password.', JSON.stringify(t3));

    // Test 4 — Both wrong
    const t4 = await request('POST', '/api/auth/login', {
      email: 'wrong@example.com',
      password: 'WrongPassword123',
      role: 'speaker'
    });
    assert('Test 4 — Both wrong (401 Unauthorized)', t4.status === 401 && t4.data?.success === false && t4.data?.message === 'Invalid email or password.', JSON.stringify(t4));

    // Test 5 — Invalid token/email on GET /api/auth/me
    const t5 = await request('GET', '/api/auth/me', null, { 'x-user-email': 'invalid@example.com' });
    assert('Test 5 — Invalid session on /api/auth/me (401 Unauthorized)', t5.status === 401 && t5.data?.success === false);

    // Test 6 — Valid session on GET /api/auth/me
    const t6 = await request('GET', '/api/auth/me', null, { 'x-user-email': 'risheet@example.com' });
    assert('Test 6 — Valid session on /api/auth/me (200 OK)', t6.status === 200 && t6.data?.success === true && t6.data?.user?.email === 'risheet@example.com');

  } catch (err) {
    console.error('Test script error:', err.message);
  }

  console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
  process.exit(failed === 0 ? 0 : 1);
}

testAuth();
